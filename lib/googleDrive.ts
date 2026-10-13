import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

// Target Google Drive Folder ID
export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || "1Th3pitFNJJPitsDJ20eUhwGY4Ha7aYmw";

function getCredentialFilePath(): string | null {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const customPath = path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      ? process.env.GOOGLE_APPLICATION_CREDENTIALS
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(customPath)) return customPath;
  }

  const defaultJson = path.join(process.cwd(), "google-service-account.json");
  if (fs.existsSync(defaultJson)) return defaultJson;

  return null;
}

function cleanPrivateKey(key: string): string {
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\n/g, "\n").trim();

  if (!cleaned.includes("-----BEGIN PRIVATE KEY-----")) {
    cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}`;
  }
  if (!cleaned.includes("-----END PRIVATE KEY-----")) {
    cleaned = `${cleaned}\n-----END PRIVATE KEY-----\n`;
  }
  return cleaned;
}

/**
 * Checks whether Google Service Account credentials are provided.
 */
export function isGoogleDriveConfigured(): boolean {
  if (process.env.GOOGLE_APPS_SCRIPT_URL) {
    return true;
  }
  if (getCredentialFilePath()) {
    return true;
  }
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (clientEmail && privateKey) {
    return true;
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return true;
  }
  return false;
}

/**
 * Initializes and returns an authenticated Google Drive client.
 */
function getDriveClient() {
  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
  ];

  // 1. JSON file path
  const keyFilePath = getCredentialFilePath();
  if (keyFilePath) {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes,
    });
    return google.drive({ version: "v3", auth });
  }

  // 2. Raw JSON string provided
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes,
      });
      return google.drive({ version: "v3", auth });
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
    }
  }

  // 3. Client email and private key directly in environment variables
  const clientEmail =
    process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && rawKey) {
    const privateKey = cleanPrivateKey(rawKey);
    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes,
    });
    return google.drive({ version: "v3", auth: jwtClient });
  }

  throw new Error(
    "Google Drive credentials not found. Please configure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY or google-service-account.json"
  );
}

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  fileName: string;
}

/**
 * Uploads a resume buffer to the specified Google Drive folder
 * and sets read permission so recruiters/HR can view it.
 */
export async function uploadResumeToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<DriveUploadResult> {
  const folderId = GOOGLE_DRIVE_FOLDER_ID;

  // 1. Google Apps Script Web App (uses account's 15GB quota directly, avoids service account 0-byte quota error)
  if (process.env.GOOGLE_APPS_SCRIPT_URL) {
    try {
      const res = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        redirect: "follow",
        body: JSON.stringify({
          folderId,
          fileName,
          mimeType,
          fileBase64: buffer.toString("base64"),
        }),
      });
      const data = await res.json();
      if (data.success && data.fileId) {
        return {
          fileId: data.fileId,
          webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.fileId}/view?usp=sharing`,
          fileName,
        };
      }
      throw new Error(data.error || "Google Apps Script upload failed");
    } catch (appsScriptErr: unknown) {
      console.error("Apps Script upload error:", appsScriptErr);
      throw appsScriptErr;
    }
  }

  // 2. Google Service Account upload
  const drive = getDriveClient();

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink, webContentLink",
  });

  const fileId = response.data.id;
  if (!fileId) {
    throw new Error("Failed to obtain file ID from Google Drive response.");
  }

  // Make the file readable with link so HR/recruiter can open the resume
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  } catch (permError) {
    console.warn("Notice: Drive permissions could not be set explicitly (folder may inherit):", permError);
  }

  const webViewLink =
    response.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

  return {
    fileId,
    webViewLink,
    fileName: response.data.name || fileName,
  };
}
