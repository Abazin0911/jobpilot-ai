import { NextResponse } from "next/server";

import { generateAnalysisResult } from "@/lib/analysis";
import { extractTextFromCv, isSupportedCvFile } from "@/lib/cv-text";

export const runtime = "nodejs";

const GEMINI_RATE_LIMIT_MESSAGE =
  "AI analysis is temporarily unavailable because the Gemini API rate limit has been reached. Please try again in about 1 minute.";

function isGeminiRateLimitError(error: unknown): boolean {
  const details = error instanceof Error ? error.message : String(error);
  return /RESOURCE_EXHAUSTED|quota exceeded|rate limit|\b429\b/i.test(details);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv");
    const jobDescription = String(formData.get("jobDescription") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload your CV before analyzing." },
        { status: 400 },
      );
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Please paste a job description before continuing." },
        { status: 400 },
      );
    }

    if (!isSupportedCvFile(file)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX CV." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let cvText = "";
    try {
      cvText = await extractTextFromCv(buffer, file.name, file.type);
    } catch (error) {
      console.error("[analyze] PDF/DOCX extraction failed", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    if (!cvText.trim()) {
      console.error("[analyze] Extraction succeeded but returned empty text", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
      return NextResponse.json(
        { error: "We could not read any text from the uploaded CV. Please try another file." },
        { status: 400 },
      );
    }

    const result = await generateAnalysisResult({
      cvText,
      jobDescription,
      fileName: file.name,
    });

    return NextResponse.json({
      success: true,
      result,
      cvText,
    });
  } catch (error) {
    if (isGeminiRateLimitError(error)) {
      return NextResponse.json(
        { error: GEMINI_RATE_LIMIT_MESSAGE },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "AI analysis is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
