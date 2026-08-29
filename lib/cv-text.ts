import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export function isSupportedCvFile(file: File | { name?: string; type?: string }): boolean {
  const fileName = (file.name ?? "").toLowerCase();
  const mimeType = (file.type ?? "").toLowerCase();

  return (
    mimeType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    mimeType.includes("word") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc")
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
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text ?? "";
  }

  if (
    normalizedType.includes("word") ||
    normalizedName.endsWith(".docx") ||
    normalizedName.endsWith(".doc")
  ) {
    if (normalizedName.endsWith(".doc")) {
      throw new Error("DOC files are not supported in this prototype. Please upload a PDF or DOCX file.");
    }

    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX CV.");
}
