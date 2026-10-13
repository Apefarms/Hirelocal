/**
 * Resume Parser Utilities
 *
 * Extracts text from uploaded resumes (DOCX, PDF, images) and maps
 * extracted text to structured candidate fields using regex/heuristics.
 *
 * This is the placeholder for real structured extraction. Once the Claude API
 * is wired in, replace mapFieldsFromText() with an LLM call.
 */

import mammoth from "mammoth";
import fs from "fs";
import { execSync } from "child_process";

/* ═══════════════════════════════════════════
   Skills keyword list
   ═══════════════════════════════════════════ */

export const SKILLS_KEYWORDS: string[] = [
  // From mockData jobs
  "Physical Fitness", "Hindi Speaking", "Basic Math", "Punctuality",
  "Tally ERP", "Tally", "GST Knowledge", "GST", "Excel", "B.Com", "Accounting",
  "AutoCAD", "Civil Engineering", "2D Drafting", "3D Modeling", "Revit",
  "Communication", "Sales", "English Speaking", "Customer Service",
  "Typing Speed", "Data Entry", "Attention to Detail", "Computer Basics",
  // Generic skills
  "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java",
  "HTML", "CSS", "SQL", "MongoDB", "PostgreSQL", "Git",
  "AWS", "Docker", "Kubernetes", "Linux",
  "Photoshop", "Illustrator", "Figma", "Canva",
  "MS Office", "Word", "PowerPoint",
  "SketchUp", "MATLAB", "SAP",
  "Project Management", "Team Leadership", "Problem Solving",
  "Machine Learning", "AI", "Data Analysis", "Tableau", "Power BI",
  "Marketing", "SEO", "Digital Marketing", "Social Media",
  "Forklift Operation", "Electrical Basics", "Plumbing",
  "Nursing", "First Aid", "Patient Care",
  "Driving License", "Delivery", "Logistics",
];

/* ═══════════════════════════════════════════
   Text Extraction
   ═══════════════════════════════════════════ */

/**
 * Checks if Tesseract OCR binary is installed and reachable.
 * Returns true if available locally (e.g. Windows dev machine), false on Vercel/serverless environments.
 */
export function isTesseractAvailable(): boolean {
  const customPath = process.env.TESSERACT_PATH;
  if (customPath) {
    try {
      if (fs.existsSync(customPath)) {
        return true;
      }
    } catch {
      // Ignore filesystem access check errors
    }
  }

  try {
    const cmd = process.platform === "win32" ? "where tesseract" : "which tesseract";
    execSync(cmd, { stdio: "ignore", timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract text from a DOCX file buffer
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * Extract text from a PDF file buffer
 * Uses pdf-parse for text-based PDFs
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Use pdf-parse/lib/pdf-parse.js directly to avoid the debug mode `!module.parent` readFileSync side-effect in Next.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdfParse(buffer);
  return (data.text || "").trim();
}

/**
 * Extract text from an image file using Tesseract OCR.
 * Gracefully returns empty string if Tesseract is not installed in the environment (e.g. on Vercel).
 */
export async function extractTextWithOCR(filePath: string): Promise<string> {
  if (!isTesseractAvailable()) {
    console.warn("Tesseract OCR binary not found in current environment. Gracefully skipping OCR extraction.");
    return "";
  }

  try {
    const tesseract = await import("node-tesseract-ocr");

    const config: Record<string, string> = {
      lang: "eng",
      oem: "3",
      psm: "3",
    };

    // Set tesseract binary path from env if specified
    const tesseractPath = process.env.TESSERACT_PATH;
    if (tesseractPath && fs.existsSync(tesseractPath)) {
      config.binary = tesseractPath;
    }

    const text = await tesseract.recognize(filePath, config);
    return (text || "").trim();
  } catch (ocrError) {
    console.warn("OCR recognition encountered an error:", ocrError);
    return "";
  }
}

/* ═══════════════════════════════════════════
   Field Mapping (Regex/Heuristic)
   ═══════════════════════════════════════════ */

export interface MappedFields {
  name: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string[];
}

/**
 * Best-effort extraction of structured fields from raw resume text.
 * This is a placeholder for Claude API-based extraction later.
 */
export function mapFieldsFromText(rawText: string): MappedFields {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  return {
    name: extractName(lines),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    education: extractSection(rawText, "education"),
    experience: extractSection(rawText, "experience"),
    skills: extractSkills(rawText),
  };
}

/* ─── Helpers ─── */

function extractEmail(text: string): string {
  const match = text.match(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
  );
  return match ? match[0] : "";
}

function extractPhone(text: string): string {
  // Match Indian phone numbers: +91, 0, or just 10 digits
  const patterns = [
    /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/,
    /(?:\+91[\s-]?)?[6-9]\d{9}/,
    /\b\d{10}\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/[\s-]/g, "").replace(/^\+91/, "");
    }
  }
  return "";
}

function extractName(lines: string[]): string {
  // Heuristic: first non-empty line that doesn't look like a header/label
  for (const line of lines.slice(0, 5)) {
    const lower = line.toLowerCase();
    if (
      lower.includes("resume") ||
      lower.includes("curriculum") ||
      lower.includes("cv") ||
      lower.includes("objective") ||
      lower.includes("@") ||
      /^\d/.test(line) ||
      /^(phone|email|address|mobile|tel)/i.test(line)
    ) {
      continue;
    }
    // Looks like a name if it's 2-5 words, mostly alpha
    const words = line.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && /^[A-Za-z\s.]+$/.test(line)) {
      return line;
    }
  }
  return "";
}

function extractSection(text: string, sectionName: string): string {
  const patterns: Record<string, RegExp[]> = {
    education: [
      /education[:\s]*\n([\s\S]*?)(?=\n(?:experience|skills|projects|work|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
      /qualifications?[:\s]*\n([\s\S]*?)(?=\n(?:experience|skills|projects|work|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
      /academic[:\s]*\n([\s\S]*?)(?=\n(?:experience|skills|projects|work|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
    ],
    experience: [
      /(?:work\s+)?experience[:\s]*\n([\s\S]*?)(?=\n(?:education|skills|projects|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
      /employment[:\s]*\n([\s\S]*?)(?=\n(?:education|skills|projects|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
      /career[:\s]*\n([\s\S]*?)(?=\n(?:education|skills|projects|certif|objective|summary|language|interest|hobbies|reference|\n\n))/i,
    ],
  };

  const regexes = patterns[sectionName] || [];
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleaned = match[1].trim();
      if (cleaned.length > 5) {
        // Limit to first 500 chars for now
        return cleaned.slice(0, 500);
      }
    }
  }
  return "";
}

function extractSkills(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const skill of SKILLS_KEYWORDS) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  }

  return [...new Set(found)]; // deduplicate
}
