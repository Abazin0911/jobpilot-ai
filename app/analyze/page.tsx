"use client";

import Link from "next/link";
import { ChangeEvent, useRef, useState } from "react";

type AnalysisResult = {
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
  shortRecommendation: string;
  note?: string;
};

const DISPLAY_SKILL_NAMES: Record<string, string> = {
  analytics: "Analytics",
  sql: "SQL",
  python: "Python",
  product: "Product",
  stakeholders: "Stakeholder management",
  powerbi: "Power BI",
  metrics: "KPIs & metrics",
  testing: "A/B testing",
  customer_support: "Customer support",
  chat_support: "Chat support",
  email_support: "Email support",
  written_communication: "Written communication",
  problem_solving: "Problem solving",
  time_management: "Time management",
  remote_work: "Remote work",
  crm: "CRM",
  english: "English",
  russian: "Russian",
};

function getDisplaySkillName(skill: string): string {
  return DISPLAY_SKILL_NAMES[skill] ?? skill;
}

export default function AnalyzePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      const isPdf = fileName.endsWith(".pdf") || fileType.includes("pdf");
      const isDocx =
        fileName.endsWith(".docx") ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!isPdf && !isDocx) {
        event.target.value = "";
        setSelectedFile(null);
        setAnalysisResult(null);
        setErrorMessage("Unsupported file type. Please upload a PDF or DOCX CV.");
        return;
      }
    }

    setSelectedFile(file);
    setAnalysisResult(null);
    setErrorMessage("");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Please upload a CV before analyzing.");
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMessage("Please paste a job description before continuing.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("cv", selectedFile);
      formData.append("jobDescription", jobDescription.trim());

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while analyzing your CV.");
      }

      setAnalysisResult(data.result);
    } catch (error) {
      setAnalysisResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while analyzing your CV.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <nav className="flex items-center justify-between rounded-full border border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-cyan-500/30">
              J
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              JobPilot AI
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-slate-900">
              Home
            </Link>
            <a href="#" className="transition hover:text-slate-900">
              How it works
            </a>
            <a href="#" className="transition hover:text-slate-900">
              Pricing
            </a>
          </div>

          <a
            href="#"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex"
          >
            Sign in
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-700">
              CV analysis
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Analyze your application
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Upload your CV</h2>
                <p className="mt-1 text-sm text-slate-500">PDF and DOCX supported</p>
              </div>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                Secure preview only
              </span>
            </div>

            <label
              htmlFor="cv-upload"
              className="block cursor-pointer rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center transition hover:border-cyan-300 hover:bg-cyan-50/40"
            >
              <input
                id="cv-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                📄
              </div>
              <p className="mt-5 text-lg font-semibold text-slate-900">
                Drop your CV here or click to browse
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Upload a PDF or DOCX file for the real extraction flow.
              </p>
            </label>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
                Selected file
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {selectedFile ? selectedFile.name : "No file selected yet"}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Choose file
              </button>
              <span className="text-xs text-slate-500">Accepted: .pdf, .docx</span>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Paste job description
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add the role details you want to match against
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Live prototype
              </span>
            </div>

            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the full job description here...\n\nExample:\n- Senior Product Designer\n- Figma, user research, product strategy\n- Experience with SaaS B2B teams"
              className="h-[360px] w-full resize-none rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                {jobDescription.trim() ? "Ready for analysis" : "Waiting for a job description"}
              </p>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Analyzing..." : "Analyze my CV"}
              </button>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </section>
        </div>

        {analysisResult ? (
          <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-700">
                  Analysis results
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Application fit summary</h2>
              </div>
              {analysisResult.note ? (
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                  {analysisResult.note}
                </span>
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.75rem] bg-slate-900 p-6 text-white">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Overall match</p>
                <p className="mt-2 text-lg font-medium text-cyan-300">{analysisResult.verdict}</p>
                <div className="mt-4 text-5xl font-semibold text-white">
                  {analysisResult.overallMatchScore}%
                </div>
                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${analysisResult.overallMatchScore}%` }}
                  />
                </div>
                <div className="mt-5 text-sm text-slate-300">
                  Experience fit: {analysisResult.experienceMatch}%
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-cyan-200 bg-cyan-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Why you match</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {analysisResult.whyMatch.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <span className="mt-1 text-cyan-600">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Why you don&apos;t match</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {analysisResult.whyDontMatch.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <span className="mt-1 text-amber-600">!</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Skills match</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysisResult.skillsMatch.matched.length > 0 ? (
                      [...new Set(analysisResult.skillsMatch.matched.map(getDisplaySkillName))].map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No strong keyword matches detected.</span>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Missing skills</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {analysisResult.missingSkills.length > 0 ? (
                        analysisResult.missingSkills.map((skill) => (
                          <li key={skill} className="flex items-start gap-2">
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-400" />
                            <span>{skill}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-500">No major gaps detected.</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Strengths</h3>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {analysisResult.strengths.map((strength) => (
                        <li key={strength} className="flex items-start gap-2">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-500" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Recommended CV improvements</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {analysisResult.recommendedImprovements.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 text-cyan-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Final recommendation</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {analysisResult.shortRecommendation}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
