/**
 * Resume Parse API Route
 *
 * POST /api/resume-parse
 *
 * Accepts multipart form upload with a "file" field.
 * Extracts text from the uploaded resume (DOCX, PDF, or image)
 * and returns raw text + mapped fields.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  extractTextFromDocx,
  extractTextFromPdf,
  extractTextWithOCR,
  mapFieldsFromText,
} from "@/lib/resumeParser";
import { uploadResumeToDrive, isGoogleDriveConfigured } from "@/lib/googleDrive";
import pool from "@/lib/db";

// Disable body parser — we handle multipart manually
export const runtime = "nodejs";

const UPLOAD_DIR = join(process.cwd(), "tmp", "uploads");

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const candidateId = (formData.get("candidateId") as string | null) || null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const ext = "." + (fileName.split(".").pop() || "");
    const allowedExts = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}. Allowed: ${allowedExts.join(", ")}` },
        { status: 400 }
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawExt = "." + (file.name.split(".").pop() || "").toLowerCase();
    const cleanBaseName = file.name
      .substring(0, file.name.lastIndexOf("."))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueFileName = `${Date.now()}_${cleanBaseName || "resume"}${rawExt}`;

    const mimeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };
    const mimeType = mimeMap[rawExt] || file.type || "application/octet-stream";

    let publicResumePath = "";

    // 1. Upload to Google Drive (target folder: 1Th3pitFNJJPitsDJ20eUhwGY4Ha7aYmw)
    if (isGoogleDriveConfigured()) {
      try {
        const driveResult = await uploadResumeToDrive(buffer, uniqueFileName, mimeType);
        publicResumePath = driveResult.webViewLink;
        console.log("✔ Resume uploaded to Google Drive:", publicResumePath);
      } catch (driveErr) {
        console.error("❌ Google Drive upload error:", driveErr);
      }
    } else {
      console.warn("Google Drive Service Account not detected in .env.local; storing locally as fallback.");
    }

    // 2. Fallback to local storage only if Google Drive is not configured or failed
    if (!publicResumePath) {
      const RESUME_STORAGE_DIR = join(process.cwd(), "public", "Storage", "resume");
      await mkdir(RESUME_STORAGE_DIR, { recursive: true });
      const savedFilePath = join(RESUME_STORAGE_DIR, uniqueFileName);
      await writeFile(savedFilePath, buffer);
      publicResumePath = `/Storage/resume/${uniqueFileName}`;
    }

    let rawText = "";

    try {
      // ─── DOCX ───
      if (ext === ".docx") {
        rawText = await extractTextFromDocx(buffer);
      }
      // ─── PDF ───
      else if (ext === ".pdf") {
        try {
          rawText = await extractTextFromPdf(buffer);
        } catch (pdfErr) {
          console.warn("Direct PDF text extraction failed:", pdfErr);
        }

        // If very little text, likely scanned PDF — try OCR
        if (rawText.length < 50) {
          // Save to temp file for OCR
          await ensureUploadDir();
          const tempPath = join(UPLOAD_DIR, `temp_${Date.now()}.pdf`);
          await writeFile(tempPath, buffer);

          try {
            rawText = await extractTextWithOCR(tempPath);
          } catch {
            console.warn("OCR on PDF failed, proceeding with uploaded file");
          } finally {
            await cleanupFile(tempPath);
          }
        }
      }
      // ─── Image (PNG, JPG, JPEG) ───
      else if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        await ensureUploadDir();
        const tempPath = join(UPLOAD_DIR, `temp_${Date.now()}${ext}`);
        await writeFile(tempPath, buffer);

        try {
          rawText = await extractTextWithOCR(tempPath);
        } catch (ocrErr) {
          console.warn("Image OCR failed:", ocrErr);
        } finally {
          await cleanupFile(tempPath);
        }
      }
    } catch (extractErr) {
      console.warn("Text extraction warning:", extractErr);
    }

    // Map fields if text was extracted
    const mappedFields = (rawText && rawText.trim().length > 0)
      ? mapFieldsFromText(rawText)
      : null;

    // Record resume in MySQL database
    try {
      const resumeRecordId = `res-${Date.now()}`;
      await pool.query(
        `INSERT INTO resumes (id, candidate_id, file_name, extracted_text, extracted_skills) VALUES (?, ?, ?, ?, ?)`,
        [
          resumeRecordId,
          candidateId || null,
          publicResumePath,
          rawText ? rawText.slice(0, 65000) : null,
          JSON.stringify(mappedFields?.skills || []),
        ]
      );

      if (candidateId) {
        await pool.query(
          `UPDATE candidates SET resume = ?, resume_url = ? WHERE id = ?`,
          [publicResumePath, publicResumePath, candidateId]
        );
      }
    } catch (dbErr) {
      console.warn("Notice: could not record resume in MySQL table:", dbErr);
    }

    return NextResponse.json({
      rawText,
      mappedFields,
      resumePath: publicResumePath,
      fileName: file.name,
      message: mappedFields
        ? "Resume parsed and saved successfully"
        : "Resume uploaded and saved. Please fill in any remaining details.",
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? `Failed to parse resume: ${error.message}`
          : "An unexpected error occurred while parsing the resume",
      },
      { status: 500 }
    );
  }
}

async function cleanupFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Ignore cleanup errors
  }
}
