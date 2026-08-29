import { NextResponse } from "next/server";

import { generateImprovedCv } from "@/lib/analysis";

export const runtime = "nodejs";

function isGeminiRateLimitError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const details = error as { message?: unknown; status?: unknown; statusCode?: unknown };
    if (details.status === 429 || details.statusCode === 429) return true;
    if (typeof details.message === "string" && /RESOURCE_EXHAUSTED|quota exceeded|rate limit|\b429\b/i.test(details.message)) {
      return true;
    }
  }
  const details = error instanceof Error ? error.message : String(error);
  return /RESOURCE_EXHAUSTED|quota exceeded|rate limit|\b429\b/i.test(details);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cvText = typeof body.cvText === "string" ? body.cvText.trim() : "";
    const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: "CV content and job description are required." }, { status: 400 });
    }
    const improvedCv = await generateImprovedCv(cvText, jobDescription);
    return NextResponse.json({ success: true, improvedCv });
  } catch (error) {
    if (isGeminiRateLimitError(error)) {
      return NextResponse.json({ error: "AI improvement is temporarily unavailable. Please try again later." }, { status: 429 });
    }
    return NextResponse.json({ error: "We could not improve your CV right now. Please try again later." }, { status: 500 });
  }
}
