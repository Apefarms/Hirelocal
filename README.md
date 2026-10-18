# Sri city Jobs — Hyperlocal Job Portal

A modern, fast, and mobile-friendly recruitment platform designed for industrial and manufacturing job ecosystems (featuring Sri City integration). Built with Next.js App Router, TypeScript, Tailwind CSS, and MySQL.

**Made by — APE Tech**

---

## 🌟 Key Features

* **Candidate Portal**:
  * Multi-step intuitive job application form with career profiling, machine experience, and domain expertise.
  * Instant ATS Resume generation with client-side PDF export (`jsPDF`).
  * OCR resume parsing (PDF, DOCX, and scanned images via Tesseract OCR).
  * Direct resume storage in **Google Drive** with sharable links saved in MySQL.

* **HR / Recruiter Portal**:
  * Dedicated HR registration with Administrator approval workflow.
  * Job posting, requirement management, and candidate tracking.
  * Real-time applicant skill match scoring and resume viewer.
  * One-click candidate shortlisting and rejection.

* **Admin Portal (`/HL-admin`)**:
  * Sri City industrial-themed executive dashboard.
  * HR account approval & assignment management.
  * Comprehensive overview of live jobs, candidates, and applications.

* **Backend & Database**:
  * Persistent relational database with **MySQL** connection pooling.
  * Database schema setup and automatic seeding scripts.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Frontend**: React 19, TypeScript, Tailwind CSS
* **Database**: MySQL (`mysql2` connection pool)
* **Storage**: Google Drive (Google Apps Script Web App / Service Account)
* **Resume Parsing**: `pdf-parse`, `mammoth`, `node-tesseract-ocr`
* **PDF Engine**: `jspdf`

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <your-repository-url>
cd job_portal
npm install
```

### 2. Configure Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Fill in your configuration in `.env.local`:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=job_portal

# Google Drive Storage
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/your_deployment_id/exec
```

### 3. Initialize MySQL Database

Run the automated setup script to create database tables and seed initial mock data:

```bash
npm run db:setup
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Tables

* `hr_users` — Employer profiles, credentials, and approval status (`pending`, `approved`, `rejected`).
* `jobs` — Job listings with description, JSON requirements, salary, and linked HR user.
* `candidates` — Candidate profiles, skills, credentials, and Google Drive resume links.
* `applications` — Job applications with ATS match scores and application review status.
* `resumes` — Parsed resume metadata, OCR extracted raw text, and extracted skills.
* `payments` — Transaction logs (Razorpay).

---

## 📄 License

Private & Proprietary. All rights reserved.
