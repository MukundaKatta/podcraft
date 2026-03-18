import type { DocumentType } from "@/types";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();

  // Basic HTML to text extraction
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

export function detectDocumentType(filename: string, mimeType?: string): DocumentType {
  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    return "pdf";
  }
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return "url";
  }
  return "text";
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function estimatePageCount(text: string): number {
  const wordsPerPage = 250;
  return Math.ceil(countWords(text) / wordsPerPage);
}
