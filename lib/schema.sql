-- =========================================================
-- Database Schema for Job Portal Application
-- Database Name: job_portal
-- =========================================================

CREATE DATABASE IF NOT EXISTS `job_portal` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `job_portal`;

-- 1. HR Users / Employers Table
CREATE TABLE IF NOT EXISTS `hr_users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Jobs Table
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `requirements` JSON NOT NULL,
  `posted_date` VARCHAR(50) NOT NULL,
  `salary` VARCHAR(100) NOT NULL,
  `hr_id` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jobs_hr` FOREIGN KEY (`hr_id`) REFERENCES `hr_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Candidates Table
CREATE TABLE IF NOT EXISTS `candidates` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `education` TEXT NULL,
  `experience` TEXT NULL,
  `skills` JSON NULL,
  `resume_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Job Applications Table
CREATE TABLE IF NOT EXISTS `applications` (
  `id` VARCHAR(50) NOT NULL,
  `candidate_id` VARCHAR(50) NOT NULL,
  `job_id` VARCHAR(50) NOT NULL,
  `status` ENUM('applied', 'shortlisted', 'rejected') NOT NULL DEFAULT 'applied',
  `match_score` INT NOT NULL DEFAULT 0,
  `applied_date` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_candidate_job` (`candidate_id`, `job_id`),
  CONSTRAINT `fk_apps_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_apps_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Resumes & OCR Parsed Data Table
CREATE TABLE IF NOT EXISTS `resumes` (
  `id` VARCHAR(50) NOT NULL,
  `candidate_id` VARCHAR(50) NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `extracted_text` LONGTEXT NULL,
  `extracted_skills` JSON NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_resumes_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments Table (Razorpay Transactions)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(50) NOT NULL,
  `candidate_id` VARCHAR(50) NULL,
  `order_id` VARCHAR(100) NOT NULL,
  `payment_id` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(50) NOT NULL DEFAULT 'success',
  `item_type` VARCHAR(50) NOT NULL DEFAULT 'ats_resume_download',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payments_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
