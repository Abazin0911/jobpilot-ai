import assert from "node:assert/strict";
import { test } from "node:test";

import { createAnalysisResult } from "./analysis";
import { extractTextFromCv } from "./cv-text";

test("PDF extraction loads without browser-only DOMMatrix dependencies", async () => {
  await assert.rejects(
    extractTextFromCv(Buffer.from("not a PDF"), "resume.pdf", "application/pdf"),
    (error: unknown) =>
      error instanceof Error &&
      error.message !== "DOMMatrix is not defined" &&
      error.name === "InvalidPDFException",
  );
});

test("Russian CV matches English job description without treating ordinary Russian words as missing skills", () => {
  const cv = `
  Иван Петров
  Senior Product Analyst
  Опыт работы: 5 лет

  Навыки: SQL, Python, аналитика продукта, A/B тестирование, Power BI, метрики, stakeholder management, коммуникации.

  Опыт:
  - Анализировал продуктовые метрики, строил дашборды в Power BI и проводил A/B тесты.
  - Работал со стейкхолдерами, собирал требования и представлял результаты руководству.
  - Поддерживал продуктовые решения на основе данных и KPI.
  `;

  const jobDescription = `
  We are looking for a Product Analyst with SQL, Python, product analytics, A/B testing, stakeholder management, Power BI, and KPI tracking.
  The role requires working with product metrics, experimentation, and cross-functional stakeholders.
  `;

  const result = createAnalysisResult({ cvText: cv, jobDescription });

  assert.ok(result.skillsMatch.matched.length > 0, "Expected meaningful skills to match");
  assert.ok(result.skillsMatch.matched.some((skill) => ["sql", "python", "analytics", "testing", "powerbi", "stakeholders"].includes(skill)), "Expected key technical skills to match");
  assert.ok(result.missingSkills.every((skill) => !["специалист", "работа", "клиентами", "удаленная", "удалённая"].includes(skill)), "Generic Russian words should not be reported as missing skills");
  assert.ok(result.overallMatchScore >= 55, "Expected a realistic overall match score for a strong overlap");
});

test("Mixed Russian/English CV and Russian job description should match semantically", () => {
  const cv = `
  Olga Ivanova
  Product Analyst | SQL, Python, Power BI, analytics, experiments

  Опыт работы 4 года.
  - Анализировала продуктовые метрики и проводила A/B тесты.
  - Проводила аналитику продукта и строила дашборды в Power BI.
  - Взаимодействовала со стейкхолдерами, собирала требования и вела коммуникации.
  - Работала с KPI и управлением продуктом.
  `;

  const jobDescription = `
  Требуется продуктовый аналитик для роли, связанной с SQL, Python, аналитикой продукта, KPI, A/B тестированием, Power BI, коммуникациями и управлением стейкхолдерами.
  `;

  const result = createAnalysisResult({ cvText: cv, jobDescription });

  assert.ok(result.skillsMatch.matched.some((skill) => ["sql", "python", "analytics", "testing", "powerbi", "metrics", "stakeholders"].includes(skill)), "Expected Russian-to-English skill concepts to match semantically");
  assert.ok(result.missingSkills.every((skill) => !["специалист", "работа", "клиентами", "удаленная", "удалённая"].includes(skill)), "Generic Russian terms should be filtered out");
  assert.ok(result.overallMatchScore >= 60, "Expected a realistic score for an aligned Russian/English profile");
});

test("Russian support CV matches English chat support job description semantically", () => {
  const cv = `
  Иван Петров
  Специалист клиентской поддержки
  Опыт работы 2 года

  - Работал с входящими обращениями клиентов в чате и по email.
  - Решал проблемы с доступом, аккаунтами и заказами.
  - Работал с CRM и Zendesk, поддерживал клиентов удаленно.
  - Поддерживал письменную коммуникацию с клиентами и общался на английском и русском.
  - Управлял временем и выполнял несколько задач одновременно.
  `;

  const jobDescription = `
  Chat Support Specialist
  We are looking for a customer support specialist to help customers via chat and email.
  Responsibilities include solving customer issues, answering questions, using CRM tools, supporting remote work, maintaining written communication, and working in English and Russian.
  The role requires strong time management, problem solving, and customer support experience.
  `;

  const result = createAnalysisResult({ cvText: cv, jobDescription });

  assert.ok(result.skillsMatch.matched.some((skill) => ["Chat support", "Customer support", "Email support", "Problem solving", "CRM", "Remote work", "Written communication", "English"].includes(skill)), "Expected core support specialist skills to match semantically");
  assert.ok(result.missingSkills.length === 0, "Generic terms should not appear as missing skills for a good support match");
  assert.ok(result.overallMatchScore >= 70, "Expected a high but realistic support match score for a close fit");
});
