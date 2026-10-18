# Sri city Jobs - Vercel & TiDB Cloud Production Deployment Guide

This document provides step-by-step instructions for deploying the **Sri city Jobs** (`job_portal`) application to **Vercel** with a **TiDB Cloud Starter** MySQL-compatible serverless database.

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- Local MySQL server (or Docker MySQL container)
- Git

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd job_portal
   npm install
   ```

2. Configure local environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your local MySQL credentials:
     ```ini
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=your_local_password
     DB_NAME=job_portal
     DB_SSL=false
     ```

3. Initialize local database schema & seed data:
   ```bash
   npm run db:setup
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 2. Required Environment Variables

When deploying to Vercel, configure the following environment variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Required | Target Environment | Description | Example / Recommended Value |
| :--- | :---: | :--- | :--- | :--- |
| `DB_HOST` | **Yes** | Production / Preview | TiDB Cloud Gateway Host | `gateway01.us-east-1.prod.aws.tidbcloud.com` |
| `DB_PORT` | **Yes** | Production / Preview | TiDB Cloud Connection Port | `4000` (or `3306`) |
| `DB_USER` | **Yes** | Production / Preview | TiDB Cloud Database User | `xxxxxx.root` |
| `DB_PASSWORD` | **Yes** | Production / Preview | TiDB Cloud Database Password | *(Your TiDB password)* |
| `DB_NAME` | **Yes** | Production / Preview | Database Name | `job_portal` |
| `DB_SSL` | **Yes** | Production / Preview | Require TLS/SSL encryption | `true` |
| `DB_CONNECTION_LIMIT` | No | Production / Preview | Serverless connection pool limit | `10` |
| `GOOGLE_DRIVE_FOLDER_ID` | **Yes** | Production / Preview | Folder ID for uploaded resumes | `1Th3pitFNJJPitsDJ20eUhwGY4Ha7aYmw` |
| `GOOGLE_APPS_SCRIPT_URL` | **Yes** | Production / Preview | Web App URL for drive uploads | `https://script.google.com/macros/s/.../exec` |
| `RAZORPAY_KEY_ID` | Optional | Production / Preview | Server-side Razorpay Key ID | `rzp_live_xxxxxxxx` (or test key) |
| `RAZORPAY_KEY_SECRET` | Optional | Production / Preview | Server-side Razorpay Secret Key | *(Your Razorpay secret)* |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Production / Preview | Client-accessible Razorpay Key ID | `rzp_live_xxxxxxxx` (or test key) |

> [!IMPORTANT]
> Never set database credentials, `RAZORPAY_KEY_SECRET`, or Google keys with `NEXT_PUBLIC_` prefixes. Only variables intended for client-side rendering should carry `NEXT_PUBLIC_`.

---

## 3. TiDB Configuration

TiDB Cloud Starter is a MySQL 8.0-compatible distributed SQL database.

### Key Connection Requirements
1. **Public Endpoint & IP Access List**:
   - In TiDB Cloud Console -> Security -> IP Access List:
   - Ensure access is allowed from anywhere (`0.0.0.0/0`) or Vercel's outgoing IP ranges, since Vercel functions invoke connections dynamically from diverse AWS IP addresses.
2. **TLS / SSL**:
   - TiDB Cloud enforces TLS 1.2+ encryption.
   - The connection pool automatically enables SSL when `DB_SSL=true` or if `DB_HOST` contains `tidbcloud.com`.
3. **Connection Pooling in Serverless Functions**:
   - Standard MySQL connection pools can exhaust connections in serverless environments.
   - The application caches `_mysqlPool` on `globalThis` to reuse open connections across warm lambda executions.
   - Set `DB_CONNECTION_LIMIT=5` or `10` to avoid hitting TiDB Cloud connection quotas.
4. **Verified Schema**:
   - The database contains 6 production tables:
     - `applications`
     - `candidates`
     - `hr_users`
     - `jobs`
     - `payments`
     - `resumes`
   - All schema queries use parameterized statements (`?`), standard ANSI SQL, and JSON fields, fully compatible with TiDB.

---

## 4. Vercel Configuration

### Framework Preset & Root Directory
- **Framework Preset**: Next.js
- **Root Directory**: `job_portal` (if deploying from a monorepo or subfolder) or `./` (if root repository)
- **Node.js Version**: 20.x

### Build & Development Settings
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## 5. Google Drive Configuration

Because Vercel serverless environments are ephemeral and read-only, all uploaded candidate resumes must be stored in external cloud storage.

### Google Apps Script Web App (Recommended for Production)
1. In Google Drive, create or open the destination folder.
2. Open [script.google.com](https://script.google.com) and create a standalone web app script that receives multipart base64 payloads and saves files into the target folder.
3. Deploy the script:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone* (allows Vercel API routes to send POST requests)
4. Copy the deployment Web App URL and set it as `GOOGLE_APPS_SCRIPT_URL` in Vercel environment variables.
5. Set `GOOGLE_DRIVE_FOLDER_ID` to the destination folder ID.
6. The uploaded file's viewable link (`webViewLink`) will be automatically stored in the MySQL `resumes` and `candidates` tables.

---

## 6. Razorpay Configuration

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Generate API Keys in **Settings > API Keys** (Test or Live mode).
3. Set in Vercel Environment Variables:
   - `RAZORPAY_KEY_ID` (and `NEXT_PUBLIC_RAZORPAY_KEY_ID`)
   - `RAZORPAY_KEY_SECRET`
4. The payment workflow:
   - Order creation occurs via `POST /api/payment/create-order` using server-side credentials.
   - Cryptographic verification occurs in `POST /api/payment/verify` using HMAC-SHA256 signature verification before saving records to the `payments` table.

---

## 7. Build and Deployment Commands

### Validate Locally Before Deploying
```bash
# Check TypeScript & compile
npm run build

# Start production server locally to test
npm run start
```

### Deploying to Vercel
You can deploy using either the Vercel Dashboard (GitHub integration) or Vercel CLI:

#### Option A: Via GitHub (Recommended)
1. Commit the changes to your Git repository:
   ```bash
   git add .
   git commit -m "chore: prepare project for Vercel and TiDB Cloud deployment"
   git push origin main
   ```
2. In Vercel Dashboard, import the repository.
3. Add the environment variables listed in Section 2.
4. Click **Deploy**.

#### Option B: Via Vercel CLI
```bash
npx vercel
```
Follow prompts, select production, and provide environment variables when asked.

---

## 8. Production Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Access denied for user` | Invalid TiDB Cloud credentials | Verify `DB_USER` includes cluster prefix (e.g. `cluster.root`) and `DB_PASSWORD` matches TiDB. |
| `ETIMEDOUT` / `ECONNREFUSED` | TiDB Cloud IP whitelist blocked | In TiDB Console > Security > IP Access List, add `0.0.0.0/0` to allow Vercel dynamic IPs. |
| `SELF_SIGNED_CERT_IN_CHAIN` / TLS error | SSL mismatch | Ensure `DB_SSL=true`. mysql2 uses standard Node.js root CAs to trust TiDB public endpoints. |
| `Too many connections` | Connection pool overflow in lambdas | Ensure `DB_CONNECTION_LIMIT` is set to `5` or `10`. Connections are reused via `globalThis._mysqlPool`. |
| `Drive upload returned 403` | Quota exceeded / Service Account limit | Use `GOOGLE_APPS_SCRIPT_URL` which runs under the folder owner's personal storage quota. |
| Database test endpoint fails | DB connection unreachable | Visit `/api/db/test` to inspect connection status and live table counts. |

---

## 9. Known Vercel Limitations

1. **Read-Only Filesystem**:
   - Vercel functions cannot write files permanently to `process.cwd()` or `public/Storage/`.
   - Temporary file operations must use `os.tmpdir()` (`/tmp`), which is cleared after lambda execution finishes.
2. **Stateless Lambdas**:
   - Local memory and files are not shared between concurrent users or subsequent requests.
   - All state must reside in TiDB Cloud or Google Drive.
3. **Execution Timeout**:
   - Vercel Hobby plan has a 10s serverless function timeout (Pro plan: up to 60s/300s). Heavy synchronous operations like OCR must not block API responses.

---

## 10. Known Features Requiring External Services

1. **Tesseract OCR**:
   - Vercel serverless containers do not have native Tesseract OCR binaries installed (`tesseract.exe` is Windows-only).
   - **Handled**: The application detects binary availability via `isTesseractAvailable()`. If missing, it gracefully skips OCR extraction without crashing, stores the uploaded file in Google Drive, and returns a prompt allowing manual field entry. Text-based PDFs and DOCX files parse directly in-memory via Node libraries (`mammoth`, `pdf-parse`).
2. **Permanent Resume Storage**:
   - Resumes cannot be stored in `public/Storage/resume/` on Vercel.
   - **Handled**: Uploads are redirected to Google Drive via `GOOGLE_APPS_SCRIPT_URL`, returning a permanent Google Drive sharing link stored directly in TiDB.
