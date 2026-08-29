import { GoogleGenAI } from "@google/genai";

export type AnalysisResult = {
  overallMatchScore: number;
  verdict: "Strong match" | "Good match" | "Partial match" | "Weak match";
  whyMatch: string[];
  whyDontMatch: string[];
  skillsMatch: {
    matched: string[];
    missing: string[];
  };
  experienceMatch: number;
  strengths: string[];
  missingSkills: string[];
  recommendedImprovements: string[];
  missingKeywords: string[];
  atsCompatibility: {
    score: number;
    status: "Strong" | "Good" | "Needs work";
    details: string;
  };
  cvImprovementSuggestions: Array<{
    original: string;
    suggestion: string;
  }>;
  shortRecommendation: string;
  note?: string;
};

export type AnalysisInput = {
  cvText: string;
  jobDescription: string;
  fileName?: string;
};

type GeminiAnalysisPayload = Omit<AnalysisResult, "overallMatchScore" | "note"> & {
  skillCoverage: number;
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "your",
  "have",
  "has",
  "will",
  "about",
  "been",
  "their",
  "them",
  "over",
  "after",
  "through",
  "what",
  "when",
  "where",
  "who",
  "which",
  "while",
  "across",
  "role",
  "team",
  "teams",
  "work",
  "working",
  "works",
  "worked",
  "using",
  "within",
  "including",
  "under",
  "years",
  "year",
  "experience",
  "responsibilities",
  "responsibility",
  "required",
  "requirement",
  "requirements",
  "strong",
  "job",
  "jobs",
  "candidate",
  "description",
  "also",
  "must",
  "our",
  "you",
  "are",
  "can",
  "should",
  "need",
  "needs",
  "preferably",
  "both",
  "some",
  "such",
  "office",
  "other",
  "company",
  "business",
  "looking",
  "interested",
  "position",
  "positions",
  "person",
  "people",
  "provide",
  "providing",
  "ability",
  "able",
  "related",
  "help",
  "helps",
  "drive",
  "driving",
  "day",
  "days",
  "level",
  "focus",
  "focusing",
  "focused",
  "excellent",
  "good",
  "great",
  "desired",
  "ideal",
  "include",
  "includes",
  "etc",
  "like",
  "as",
  "at",
  "on",
  "we",
  "all",
  "very",
  "more",
  "most",
  "part",
  "high",
  "low",
  "around",
  "specialist",
  "specialists",
  "специалист",
  "специалисты",
  "work",
  "работа",
  "работы",
  "работал",
  "работала",
  "работали",
  "клиент",
  "клиенты",
  "клиентами",
  "customer",
  "customers",
  "client",
  "clients",
  "remote",
  "удаленная",
  "удалённая",
  "удаленно",
  "удалённо",
  "support",
  "поддержка",
  "обслуживание",
  "service",
  "services",
]);

const GENERIC_SKILL_WORDS = new Set([
  "specialist",
  "специалист",
  "work",
  "работа",
  "job",
  "role",
  "client",
  "клиент",
  "customer",
  "support",
  "поддержка",
  "service",
  "услуга",
  "communication",
  "коммуникация",
]);

const LABELS = new Map<string, string>([
  ["analytics", "Analytics"],
  ["sql", "SQL"],
  ["python", "Python"],
  ["product", "Product"],
  ["stakeholders", "Stakeholder management"],
  ["powerbi", "Power BI"],
  ["metrics", "KPIs & metrics"],
  ["testing", "A/B testing"],
  ["customer_support", "Customer support"],
  ["chat_support", "Chat support"],
  ["email_support", "Email support"],
  ["written_communication", "Written communication"],
  ["problem_solving", "Problem solving"],
  ["time_management", "Time management"],
  ["remote_work", "Remote work"],
  ["crm", "CRM"],
  ["english", "English"],
  ["russian", "Russian"],
]);

const CONCEPT_ALIASES: Array<[string, string]> = [
  ["sql", "sql"],
  ["mysql", "sql"],
  ["postgresql", "sql"],
  ["postgres", "sql"],
  ["сиквел", "sql"],
  ["sql server", "sql"],

  ["python", "python"],
  ["питон", "python"],
  ["пайтон", "python"],

  ["analytics", "analytics"],
  ["analysis", "analytics"],
  ["analyst", "analytics"],
  ["product analytics", "analytics"],
  ["product analyst", "analytics"],
  ["data analysis", "analytics"],
  ["business intelligence", "analytics"],
  ["bi", "analytics"],
  ["аналитика", "analytics"],
  ["аналитика продукта", "analytics"],
  ["аналитик", "analytics"],
  ["анализ продукта", "analytics"],

  ["product", "product"],
  ["product management", "product"],
  ["product manager", "product"],
  ["продукт", "product"],
  ["продуктовый", "product"],

  ["stakeholder management", "stakeholders"],
  ["stakeholders", "stakeholders"],
  ["stakeholder", "stakeholders"],
  ["management of stakeholders", "stakeholders"],
  ["стейкхолдеры", "stakeholders"],
  ["стейкхолдер", "stakeholders"],
  ["управление заинтересованными сторонами", "stakeholders"],
  ["работа со стейкхолдерами", "stakeholders"],

  ["power bi", "powerbi"],
  ["powerbi", "powerbi"],
  ["tableau", "powerbi"],
  ["dashboard", "powerbi"],
  ["dashboards", "powerbi"],
  ["data visualization", "powerbi"],
  ["visualization", "powerbi"],
  ["visualisation", "powerbi"],
  ["дашборды", "powerbi"],
  ["дашборд", "powerbi"],
  ["визуализация данных", "powerbi"],

  ["metrics", "metrics"],
  ["metric", "metrics"],
  ["kpi", "metrics"],
  ["kpis", "metrics"],
  ["метрики", "metrics"],
  ["метрика", "metrics"],
  ["ключевые метрики", "metrics"],
  ["kpi tracking", "metrics"],

  ["testing", "testing"],
  ["a/b testing", "testing"],
  ["ab testing", "testing"],
  ["experimentation", "testing"],
  ["experiment", "testing"],
  ["qa", "testing"],
  ["тестирование", "testing"],
  ["ab", "testing"],
  ["эксперименты", "testing"],
  ["экспериментирование", "testing"],

  ["customer support", "customer_support"],
  ["customer service", "customer_support"],
  ["support specialist", "customer_support"],
  ["support agent", "customer_support"],
  ["help desk", "customer_support"],
  ["helpdesk", "customer_support"],
  ["client support", "customer_support"],
  ["клиентская поддержка", "customer_support"],
  ["поддержка клиентов", "customer_support"],
  ["работа с клиентами", "customer_support"],

  ["chat support", "chat_support"],
  ["live chat", "chat_support"],
  ["chat", "chat_support"],
  ["email support", "email_support"],
  ["email", "email_support"],
  ["чат", "chat_support"],
  ["работа в чате", "chat_support"],
  ["в чате", "chat_support"],
  ["по email", "email_support"],
  ["электронная почта", "email_support"],
  ["онлайн поддержка", "chat_support"],

  ["written communication", "written_communication"],
  ["communication skills", "written_communication"],
  ["client communication", "written_communication"],
  ["customer communication", "written_communication"],
  ["communications", "written_communication"],
  ["communication", "written_communication"],
  ["письменная коммуникация", "written_communication"],
  ["коммуникация", "written_communication"],
  ["коммуникации", "written_communication"],
  ["общение с клиентами", "written_communication"],

  ["problem solving", "problem_solving"],
  ["solving problems", "problem_solving"],
  ["troubleshooting", "problem_solving"],
  ["issue resolution", "problem_solving"],
  ["issue handling", "problem_solving"],
  ["handling customer inquiries", "problem_solving"],
  ["customer inquiries", "problem_solving"],
  ["решение проблем", "problem_solving"],
  ["устранение проблем", "problem_solving"],
  ["работа с обращениями", "problem_solving"],
  ["обработка обращений", "problem_solving"],

  ["time management", "time_management"],
  ["multitasking", "time_management"],
  ["тайм менеджмент", "time_management"],
  ["тайм-менеджмент", "time_management"],
  ["многозадачность", "time_management"],
  ["управление временем", "time_management"],

  ["remote work", "remote_work"],
  ["remote", "remote_work"],
  ["удаленно", "remote_work"],
  ["удалённо", "remote_work"],
  ["удаленная работа", "remote_work"],
  ["удалённая работа", "remote_work"],
  ["работал удаленно", "remote_work"],
  ["работал удалённо", "remote_work"],

  ["crm", "crm"],
  ["crm system", "crm"],
  ["zendesk", "crm"],
  ["freshdesk", "crm"],
  ["intercom", "crm"],
  ["salesforce", "crm"],
  ["ticketing system", "crm"],
  ["система поддержки", "crm"],

  ["english", "english"],
  ["английский", "english"],
  ["английском", "english"],
  ["на английском", "english"],
  ["russian", "russian"],
  ["русский", "russian"],
  ["русском", "russian"],
  ["на русском", "russian"],
];

const CONCEPT_MAP = new Map<string, string>();
for (const [rawPhrase, concept] of CONCEPT_ALIASES) {
  const normalized = normalizePhrase(rawPhrase);
  if (normalized) {
    CONCEPT_MAP.set(normalized, concept);
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/&/g, " and ")
    .replace(/[_/|\\]+/g, " ")
    .replace(/[^a-zа-я0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeEnglishToken(token: string): string {
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses") && token.length > 5) return token.slice(0, -2);
  if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 4 && !token.endsWith("ses")) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3 && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function normalizePhrase(value: string): string {
  return normalizeText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeRussianToken)
    .join(" ")
    .trim();
}

function normalizeRussianToken(token: string): string {
  if (!/[а-я]/.test(token)) return token;

  const suffixes = [
    "иями",
    "ами",
    "ями",
    "ого",
    "ему",
    "ому",
    "ыми",
    "ими",
    "ение",
    "ание",
    "ению",
    "анию",
    "ией",
    "ацией",
    "ацию",
    "ация",
    "ную",
    "ная",
    "скую",
    "ской",
    "ский",
    "ская",
    "ами",
    "ями",
    "ах",
    "ях",
    "ой",
    "ей",
    "ом",
    "ем",
    "ам",
    "ям",
    "ы",
    "и",
    "а",
    "я",
    "о",
    "е",
    "у",
    "ю",
    "ь",
    "ал",
    "ял",
  ];

  for (const suffix of suffixes) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      return token.slice(0, -suffix.length);
    }
  }

  return token;
}

function getPhraseVariants(value: string): string[] {
  const normalized = normalizePhrase(value);
  if (!normalized) return [];

  const words = normalized.split(/\s+/).filter(Boolean);
  const variants = new Set<string>([normalized]);

  const singularized = words.map((token) => singularizeEnglishToken(token)).join(" ");
  if (singularized !== normalized) {
    variants.add(singularized);
  }

  return [...variants];
}

function matchConcept(phrase: string): string | null {
  const variants = getPhraseVariants(phrase);
  for (const variant of variants) {
    const match = CONCEPT_MAP.get(variant);
    if (match) return match;

    const candidateTokens = variant.split(" ");
    for (const [mappedPhrase, concept] of CONCEPT_MAP) {
      const mappedTokens = mappedPhrase.split(" ");
      if (
        mappedTokens.length === candidateTokens.length &&
        mappedTokens.every((token, index) => areRelatedTokens(token, candidateTokens[index]))
      ) {
        return concept;
      }
    }
  }
  return null;
}

function areRelatedTokens(left: string, right: string): boolean {
  if (left === right) return true;
  if (!/[а-я]/.test(left) || !/[а-я]/.test(right)) return false;

  let sharedPrefixLength = 0;
  while (sharedPrefixLength < left.length && sharedPrefixLength < right.length && left[sharedPrefixLength] === right[sharedPrefixLength]) {
    sharedPrefixLength += 1;
  }

  return sharedPrefixLength >= 4;
}

function isGenericPhrase(phrase: string, concept: string): boolean {
  const canonicalPhrase = normalizePhrase(phrase);
  const canonicalConcept = normalizePhrase(concept);

  if (!canonicalPhrase || !canonicalConcept) return true;
  if (canonicalPhrase.split(/\s+/).filter(Boolean).length > 1) {
    return false;
  }
  if (canonicalConcept.split(/\s+/).filter(Boolean).length > 1) {
    return false;
  }
  if (STOP_WORDS.has(canonicalPhrase) || STOP_WORDS.has(canonicalConcept)) return true;
  if (GENERIC_SKILL_WORDS.has(canonicalPhrase) || GENERIC_SKILL_WORDS.has(canonicalConcept)) return true;
  return false;
}

function extractConcepts(value: string): Set<string> {
  const tokens = normalizePhrase(value).split(/\s+/).filter(Boolean);
  const concepts = new Set<string>();

  for (let index = 0; index < tokens.length; index += 1) {
    const maxLength = Math.min(4, tokens.length - index);
    for (let length = maxLength; length >= 1; length -= 1) {
      const phrase = tokens.slice(index, index + length).join(" ");
      const concept = matchConcept(phrase);
      if (!concept || isGenericPhrase(phrase, concept)) continue;
      concepts.add(concept);
      index += length - 1;
      break;
    }
  }

  return concepts;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function detectExperienceYears(value: string): number {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:\+\s*)?(?:years?|yrs?)/gi,
    /(\d+(?:\.\d+)?)\s*(?:лет|года|год|году)/gi,
  ];

  let maxValue = 0;

  for (const pattern of patterns) {
    for (const match of value.matchAll(pattern)) {
      const parsedValue = Number.parseFloat(match[1]);
      if (!Number.isNaN(parsedValue)) maxValue = Math.max(maxValue, parsedValue);
    }
  }

  return maxValue;
}

function calculateExperienceFit(cvText: string, jobText: string): number {
  const cvYears = detectExperienceYears(cvText);
  const jobYears = detectExperienceYears(jobText);

  if (cvYears > 0 && jobYears > 0) {
    const ratio = Math.min(cvYears / Math.max(jobYears, 1), 1.5);
    return clamp(Math.round(55 + ratio * 35), 35, 98);
  }

  if (cvYears > 0) {
    return clamp(Math.round(55 + Math.min(cvYears / 5, 1) * 30), 40, 94);
  }

  return 62;
}

function buildStrengths(cvConcepts: Set<string>): string[] {
  const strengths: string[] = [];

  if (cvConcepts.has("analytics") || cvConcepts.has("python") || cvConcepts.has("sql")) {
    strengths.push("The CV shows analytical and technical capability relevant to data-driven decision making.");
  }

  if (cvConcepts.has("customer_support") || cvConcepts.has("chat_support")) {
    strengths.push("The profile demonstrates direct customer support experience and service-oriented problem handling.");
  }

  if (cvConcepts.has("written_communication") || cvConcepts.has("problem_solving")) {
    strengths.push("The CV shows strong communication and issue-handling skills in customer-facing contexts.");
  }

  if (cvConcepts.has("stakeholders") || cvConcepts.has("crm")) {
    strengths.push("The candidate has evidence of stakeholder coordination and support tooling usage.");
  }

  if (strengths.length === 0) {
    strengths.push("The CV presents relevant professional experience and a clear role fit.");
  }

  return strengths.slice(0, 3);
}

function buildRecommendedImprovements(missingSkills: string[], skillCoverage: number): string[] {
  const improvements = [
    "If applicable, add measurable achievements using only real and verifiable metrics, such as customer volume, ticket volume, response times, or business impact.",
    "Only include tools, platforms, and workflows that you have actually used; otherwise, consider completing practical training before listing them in your CV.",
    "Align the CV wording more closely with the target role to improve ATS visibility.",
  ];

  if (missingSkills.length > 0) {
    improvements.push(
      `If applicable, describe your actual experience with ${missingSkills.slice(0, 2).join(" and ")}. Only include this if you have actual experience.`,
    );
  }

  if (skillCoverage < 60) {
    improvements.push("Strengthen the headline and summary so the candidate profile reflects the key job priorities more clearly.");
  }

  return improvements.slice(0, 4);
}

function buildAtsCompatibility(skillCoverage: number, experienceMatch: number, cvText: string): AnalysisResult["atsCompatibility"] {
  const score = clamp(Math.round(skillCoverage * 0.7 + experienceMatch * 0.3), 15, 100);
  const status = score >= 75 ? "Strong" : score >= 55 ? "Good" : "Needs work";
  const details =
    cvText.trim().length >= 250 && skillCoverage >= 60
      ? "The CV contains enough searchable content and relevant terminology for an ATS-style screening."
      : "The CV would benefit from clearer role-specific keywords, standard headings, and more searchable evidence.";
  return { score, status, details };
}

function buildCvImprovementSuggestions(cvText: string, matchedSkills: string[]): AnalysisResult["cvImprovementSuggestions"] {
  const firstBullet = cvText
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•*-]+/, "").trim())
    .find((line) => line.length >= 25 && !/:$/.test(line));
  if (!firstBullet) return [];
  const focus = matchedSkills.slice(0, 2).join(" and ");
  return [{
    original: firstBullet,
    suggestion: focus
      ? `Rewrite with a clear action, context, and result, using your real ${focus} experience.`
      : "Rewrite with a clear action, context, and result using only verifiable details from your experience.",
  }];
}

function getVerdict(score: number): AnalysisResult["verdict"] {
  if (score >= 75) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Partial match";
  return "Weak match";
}

function buildWhyMatch(matchedSkills: string[], experienceMatch: number): string[] {
  const reasons = matchedSkills.slice(0, 4).map((skill) => `The CV demonstrates experience with ${skill}.`);
  if (experienceMatch >= 70) reasons.push(`The profile shows a solid level of relevant professional experience (${experienceMatch}%).`);
  if (reasons.length < 3) reasons.push("The CV shows relevant responsibilities aligned with the target role.");
  return reasons.slice(0, 5);
}

function buildWhyDontMatch(missingSkills: string[], experienceMatch: number): string[] {
  const reasons = missingSkills.slice(0, 4).map((skill) => `The CV does not clearly demonstrate ${skill}.`);
  if (experienceMatch < 70) reasons.push(`The experience evidence is limited for this role (${experienceMatch}%).`);
  return reasons.length > 0 ? reasons.slice(0, 5) : ["No significant gaps were identified against the provided requirements."];
}

function protectRecommendations(recommendations: string[], missingSkills: string[]): string[] {
  const missingTools = missingSkills.some((skill) => /crm|helpdesk|zendesk|freshdesk|support platform/i.test(skill));
  return recommendations.map((recommendation) => {
    let safeRecommendation = recommendation;
    if (/\b(metric|metrics|number|numbers|kpi|customers?|tickets?|volume|results?|response time)/i.test(safeRecommendation) &&
        !/real and verifiable/i.test(safeRecommendation)) {
      safeRecommendation += " Only include real and verifiable data.";
    }
    if (missingTools && /\b(crm|helpdesk|zendesk|freshdesk|support platform)/i.test(safeRecommendation) &&
        !/practical (experience|training)|actual experience/i.test(safeRecommendation)) {
      safeRecommendation += " Consider completing practical training first; only list these tools after gaining actual experience.";
    }
    if (/\b(add|include|highlight|list|describe|demonstrate|gain)\b.*\b(experience|skill|tool|platform|workflow)/i.test(safeRecommendation) &&
        !/if applicable|only include this if you have actual experience/i.test(safeRecommendation)) {
      safeRecommendation = `If applicable, ${safeRecommendation} Only include this if you have actual experience.`;
    }
    return safeRecommendation;
  }).filter((recommendation) => !/^if applicable[,.]?\s*only include this if you have actual experience\.?$/i.test(recommendation.trim()));
}

function filterMissingSkills(items: string[]): string[] {
  const filtered = items.filter((item) => {
    const normalized = normalizePhrase(item);
    if (!normalized) return false;
    if (STOP_WORDS.has(normalized)) return false;
    if (GENERIC_SKILL_WORDS.has(normalized)) return false;
    return true;
  });

  return filtered.slice(0, 5);
}

export function createAnalysisResult(input: AnalysisInput): AnalysisResult {
  const cvConcepts = extractConcepts(input.cvText);
  const jobConcepts = extractConcepts(input.jobDescription);

  const matchedConcepts = [...new Set([...jobConcepts].filter((concept) => cvConcepts.has(concept)))];
  const missingConcepts = [...new Set([...jobConcepts].filter((concept) => !cvConcepts.has(concept)))];

  const matchedDisplaySkills = matchedConcepts
    .map((concept) => LABELS.get(concept) ?? concept)
    .filter((skill) => Boolean(skill) && !GENERIC_SKILL_WORDS.has(normalizePhrase(skill)) && !STOP_WORDS.has(normalizePhrase(skill)))
    .slice(0, 8);

  const missingDisplaySkills = missingConcepts
    .map((concept) => LABELS.get(concept) ?? concept)
    .filter((skill) => Boolean(skill) && !GENERIC_SKILL_WORDS.has(normalizePhrase(skill)) && !STOP_WORDS.has(normalizePhrase(skill)))
    .filter((skill) => !matchedDisplaySkills.includes(skill))
    .slice(0, 5);

  const skillsMatched = matchedConcepts
    .flatMap((concept) => {
      const display = LABELS.get(concept);
      return display ? [concept, display] : [concept];
    })
    .slice(0, 8);
  const missingSkills = filterMissingSkills(missingDisplaySkills);

  const skillCoverage = jobConcepts.size === 0 ? 0 : (matchedConcepts.length / jobConcepts.size) * 100;
  const experienceMatch = calculateExperienceFit(input.cvText, input.jobDescription);
  const overallMatchScore = clamp(Math.round(skillCoverage * 0.8 + experienceMatch * 0.2), 15, 97);

  const strengths = buildStrengths(cvConcepts);
  const recommendedImprovements = buildRecommendedImprovements(missingSkills, skillCoverage);
  const atsCompatibility = buildAtsCompatibility(skillCoverage, experienceMatch, input.cvText);
  const cvImprovementSuggestions = buildCvImprovementSuggestions(input.cvText, matchedDisplaySkills);

  const shortRecommendation =
    overallMatchScore >= 75
      ? "Strong match for the role. The candidate profile aligns well with the target responsibilities and key skill requirements."
      : overallMatchScore >= 55
        ? "Reasonable alignment with the role. The profile matches the main work well, with a few gaps to close in the CV."
        : "The profile shows relevant experience, but there are still meaningful gaps between the CV and the role requirements.";
  const verdict = getVerdict(overallMatchScore);
  const whyMatch = buildWhyMatch(matchedDisplaySkills, experienceMatch);
  const whyDontMatch = buildWhyDontMatch(missingSkills, experienceMatch);

  return {
    overallMatchScore,
    verdict,
    whyMatch,
    whyDontMatch,
    skillsMatch: {
      matched: skillsMatched,
      missing: missingSkills,
    },
    experienceMatch,
    strengths,
    missingSkills,
    recommendedImprovements,
    missingKeywords: missingSkills,
    atsCompatibility,
    cvImprovementSuggestions,
    shortRecommendation,
    note: process.env.GEMINI_API_KEY
      ? "AI analysis powered by Gemini."
      : "Mock analysis mode is active because no Gemini API key is configured yet.",
  };
}

export async function generateAnalysisResult(input: AnalysisInput): Promise<AnalysisResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    return createAnalysisResult(input);
  }

  const client = new GoogleGenAI({ apiKey: geminiApiKey });
  const response = await client.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      "Analyze this CV and job description. Return only valid JSON, with no markdown or commentary.",
      "Use human-readable skill names, never internal IDs. Keep skillsMatch.missing and missingSkills identical.",
      "Do not include a skill in both matched and missing.",
      "Never suggest inventing or exaggerating experience, skills, tools, metrics, KPIs, customer counts, ticket counts, or results.",
      "For potentially absent experience, use exactly: If applicable. Only include this if you have actual experience.",
      "For metrics, explicitly require real and verifiable data.",
      "For CRM or helpdesk tools absent from the CV, recommend practical training first and listing the tool only after gaining real experience.",
      "The final recommendation must describe only evidence present in the CV and must not claim unsupported experience.",
      "Missing keywords must be taken only from the job description and absent from the CV.",
      "ATS compatibility must reflect searchable extracted CV content and the role's terminology.",
      "CV improvement suggestions may rewrite only wording present in the CV; never invent facts.",
      "",
      "CV:",
      input.cvText,
      "",
      "Job description:",
      input.jobDescription,
      "",
      "Return JSON with exactly these fields:",
      JSON.stringify({
        skillCoverage: 0,
        verdict: "Partial match",
        whyMatch: ["specific CV evidence matching the role"],
        whyDontMatch: ["specific missing requirement or limitation"],
        skillsMatch: { matched: ["human-readable skill"], missing: ["human-readable skill"] },
        experienceMatch: 0,
        strengths: ["concise strength"],
        missingSkills: ["human-readable skill"],
        recommendedImprovements: ["actionable improvement"],
        missingKeywords: ["important keyword from the job description"],
        atsCompatibility: { score: 0, status: "Needs work", details: "ATS screening summary" },
        cvImprovementSuggestions: [{ original: "weak CV bullet", suggestion: "safe rewritten example" }],
        shortRecommendation: "concise recommendation",
      }),
      "skillCoverage and experienceMatch must be percentages from 0 to 100.",
    ].join("\n"),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          skillCoverage: { type: "NUMBER" },
          verdict: { type: "STRING", enum: ["Strong match", "Good match", "Partial match", "Weak match"] },
          whyMatch: { type: "ARRAY", items: { type: "STRING" }, minItems: 3, maxItems: 5 },
          whyDontMatch: { type: "ARRAY", items: { type: "STRING" }, minItems: 1, maxItems: 5 },
          skillsMatch: {
            type: "OBJECT",
            properties: {
              matched: { type: "ARRAY", items: { type: "STRING" } },
              missing: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["matched", "missing"],
          },
          experienceMatch: { type: "NUMBER" },
          strengths: { type: "ARRAY", items: { type: "STRING" } },
          missingSkills: { type: "ARRAY", items: { type: "STRING" } },
          recommendedImprovements: { type: "ARRAY", items: { type: "STRING" } },
          missingKeywords: { type: "ARRAY", items: { type: "STRING" } },
          atsCompatibility: {
            type: "OBJECT",
            properties: {
              score: { type: "NUMBER" },
              status: { type: "STRING", enum: ["Strong", "Good", "Needs work"] },
              details: { type: "STRING" },
            },
            required: ["score", "status", "details"],
          },
          cvImprovementSuggestions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                original: { type: "STRING" },
                suggestion: { type: "STRING" },
              },
              required: ["original", "suggestion"],
            },
          },
          shortRecommendation: { type: "STRING" },
        },
        required: [
          "skillCoverage",
          "verdict",
          "whyMatch",
          "whyDontMatch",
          "skillsMatch",
          "experienceMatch",
          "strengths",
          "missingSkills",
          "recommendedImprovements",
          "missingKeywords",
          "atsCompatibility",
          "cvImprovementSuggestions",
          "shortRecommendation",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned no text analysis.");
  }

  const payload = parseGeminiAnalysis(response.text);
  const overallMatchScore = clamp(Math.round(payload.skillCoverage * 0.8 + payload.experienceMatch * 0.2), 15, 97);

  return {
    overallMatchScore,
    verdict: payload.verdict,
    whyMatch: payload.whyMatch,
    whyDontMatch: payload.whyDontMatch,
    skillsMatch: payload.skillsMatch,
    experienceMatch: payload.experienceMatch,
    strengths: payload.strengths,
    missingSkills: payload.missingSkills,
    recommendedImprovements: protectRecommendations(payload.recommendedImprovements, payload.missingSkills),
    missingKeywords: payload.missingKeywords,
    atsCompatibility: payload.atsCompatibility,
    cvImprovementSuggestions: payload.cvImprovementSuggestions,
    shortRecommendation: payload.shortRecommendation,
    note: "AI analysis powered by Gemini.",
  };
}

function parseGeminiAnalysis(text: string): GeminiAnalysisPayload {
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    throw new Error("Gemini returned an invalid analysis format.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch (error) {
    throw new Error(
      `Gemini returned invalid analysis JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!isGeminiAnalysisPayload(parsed)) {
    throw new Error("Gemini returned incomplete analysis data.");
  }

  const matched = new Set(parsed.skillsMatch.matched.map((skill) => skill.toLowerCase()));
  const missing = parsed.skillsMatch.missing.filter((skill) => !matched.has(skill.toLowerCase()));

  return {
    ...parsed,
    skillsMatch: { matched: parsed.skillsMatch.matched, missing },
    missingSkills: missing,
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isStringArrayOrEmpty(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isGeminiAnalysisPayload(value: unknown): value is GeminiAnalysisPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  const skillsMatch = payload.skillsMatch;
  const atsCompatibility = payload.atsCompatibility;
  if (!skillsMatch || typeof skillsMatch !== "object") return false;
  if (!atsCompatibility || typeof atsCompatibility !== "object") return false;
  const skillMatch = skillsMatch as Record<string, unknown>;
  const ats = atsCompatibility as Record<string, unknown>;

  return (
    typeof payload.skillCoverage === "number" &&
    payload.skillCoverage >= 0 &&
    payload.skillCoverage <= 100 &&
    typeof payload.verdict === "string" &&
    ["Strong match", "Good match", "Partial match", "Weak match"].includes(payload.verdict) &&
    isStringArray(payload.whyMatch) &&
    payload.whyMatch.length >= 3 &&
    payload.whyMatch.length <= 5 &&
    isStringArray(payload.whyDontMatch) &&
    payload.whyDontMatch.length >= 1 &&
    payload.whyDontMatch.length <= 5 &&
    Array.isArray(skillMatch.matched) &&
    isStringArray(skillMatch.matched) &&
    Array.isArray(skillMatch.missing) &&
    isStringArray(skillMatch.missing) &&
    typeof payload.experienceMatch === "number" &&
    payload.experienceMatch >= 0 &&
    payload.experienceMatch <= 100 &&
    Array.isArray(payload.strengths) &&
    isStringArray(payload.strengths) &&
    Array.isArray(payload.missingSkills) &&
    isStringArray(payload.missingSkills) &&
    Array.isArray(payload.recommendedImprovements) &&
    isStringArray(payload.recommendedImprovements) &&
    Array.isArray(payload.missingKeywords) &&
    isStringArrayOrEmpty(payload.missingKeywords) &&
    typeof ats.score === "number" &&
    ats.score >= 0 &&
    ats.score <= 100 &&
    ["Strong", "Good", "Needs work"].includes(String(ats.status)) &&
    typeof ats.details === "string" &&
    Array.isArray(payload.cvImprovementSuggestions) &&
    payload.cvImprovementSuggestions.every((item) => {
      if (!item || typeof item !== "object") return false;
      const suggestion = item as Record<string, unknown>;
      return typeof suggestion.original === "string" &&
        suggestion.original.trim().length > 0 &&
        typeof suggestion.suggestion === "string" &&
        suggestion.suggestion.trim().length > 0;
    }) &&
    typeof payload.shortRecommendation === "string" &&
    payload.shortRecommendation.trim().length > 0
  );
}
