import { createRequire } from "node:module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
type PdfParse = (buffer: Buffer) => Promise<{ text?: string }>;

export function isSupportedCvFile(file: File | { name?: string; type?: string }): boolean {
  const fileName = (file.name ?? "").toLowerCase();
  const mimeType = (file.type ?? "").toLowerCase();

  return (
    mimeType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileName.endsWith(".docx") ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export async function extractTextFromCv(
  buffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<string> {
  const normalizedName = fileName.toLowerCase();
  const normalizedType = (mimeType ?? "").toLowerCase();

  if (normalizedType.includes("pdf") || normalizedName.endsWith(".pdf")) {
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as PdfParse;
    const result = await pdfParse(buffer);
    return result.text ?? "";
  }

  if (
    normalizedName.endsWith(".docx") ||
    normalizedType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX CV.");
}
