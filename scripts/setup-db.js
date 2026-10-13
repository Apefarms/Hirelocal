const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read DB config from .env.local if present
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_portal',
  ssl:
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'))
      ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
      : undefined,
};

async function setupDatabase() {
  console.log('Connecting to MySQL server...');
  let connection;
  try {
    // 1. Connect without selecting database to ensure DB creation
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
    });

    console.log('✔ Connected to MySQL server.');

    // 2. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✔ Database "${config.database}" created or verified.`);

    // 3. Switch to target database
    await connection.changeUser({ database: config.database });

    // 4. Create Tables
    console.log('Creating database tables...');

    // hr_users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`hr_users\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`company\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`status\` VARCHAR(20) NOT NULL DEFAULT 'approved',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  - Table hr_users ready.');

    // jobs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`jobs\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`company\` VARCHAR(255) NOT NULL,
        \`location\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`requirements\` JSON NOT NULL,
        \`posted_date\` VARCHAR(50) NOT NULL,
        \`salary\` VARCHAR(100) NOT NULL,
        \`hr_id\` VARCHAR(50) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_jobs_hr\` FOREIGN KEY (\`hr_id\`) REFERENCES \`hr_users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  - Table jobs ready.');

    // candidates
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`candidates\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`education\` TEXT NULL,
        \`experience\` TEXT NULL,
        \`skills\` JSON NULL,
        \`resume_url\` VARCHAR(500) NULL,
        \`resume\` VARCHAR(500) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  - Table candidates ready.');

    // applications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`applications\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`candidate_id\` VARCHAR(50) NOT NULL,
        \`job_id\` VARCHAR(50) NOT NULL,
        \`status\` ENUM('applied', 'shortlisted', 'rejected') NOT NULL DEFAULT 'applied',
        \`match_score\` INT NOT NULL DEFAULT 0,
        \`applied_date\` VARCHAR(50) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uk_candidate_job\` (\`candidate_id\`, \`job_id\`),
        CONSTRAINT \`fk_apps_candidate\` FOREIGN KEY (\`candidate_id\`) REFERENCES \`candidates\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_apps_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  - Table applications ready.');

    // resumes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`resumes\` (
        \`id\` VARCHAR(50) NOT NULL,
        \`candidate_id\` VARCHAR(50) NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`extracted_text\` LONGTEXT NULL,
        \`extracted_skills\` JSON NULL,
        \`uploaded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_resumes_candidate\` FOREIGN KEY (\`candidate_id\`) REFERENCES \`candidates\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('  - Table resumes ready.');

    // 5. Seed initial data from mockData.json if tables are empty
    const mockDataPath = path.join(__dirname, '../data/mockData.json');
    if (fs.existsSync(mockDataPath)) {
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

      // Seed HR Users
      const [hrRows] = await connection.query('SELECT COUNT(*) as count FROM hr_users');
      if (hrRows[0].count === 0 && mockData.hrUsers) {
        console.log('Seeding hr_users table...');
        for (const hr of mockData.hrUsers) {
          await connection.query(
            'INSERT INTO hr_users (id, name, company, email, password) VALUES (?, ?, ?, ?, ?)',
            [hr.id, hr.name, hr.company, hr.email, hr.password]
          );
        }
        console.log(`  ✔ Inserted ${mockData.hrUsers.length} HR users.`);
      }

      // Seed Jobs
      const [jobRows] = await connection.query('SELECT COUNT(*) as count FROM jobs');
      if (jobRows[0].count === 0 && mockData.jobs) {
        console.log('Seeding jobs table...');
        for (const job of mockData.jobs) {
          // Map to HR User if applicable
          const matchingHr = mockData.hrUsers?.find(hr => hr.jobIds?.includes(job.id));
          const hrId = matchingHr ? matchingHr.id : null;
          await connection.query(
            'INSERT INTO jobs (id, title, company, location, description, requirements, posted_date, salary, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [job.id, job.title, job.company, job.location, job.description, JSON.stringify(job.requirements || []), job.postedDate, job.salary, hrId]
          );
        }
        console.log(`  ✔ Inserted ${mockData.jobs.length} jobs.`);
      }

      // Seed Candidates
      const [candRows] = await connection.query('SELECT COUNT(*) as count FROM candidates');
      if (candRows[0].count === 0 && mockData.candidates) {
        console.log('Seeding candidates table...');
        for (const cand of mockData.candidates) {
          await connection.query(
            'INSERT INTO candidates (id, name, phone, email, password, education, experience, skills, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cand.id, cand.name, cand.phone, cand.email, cand.password, cand.education || '', cand.experience || '', JSON.stringify(cand.skills || []), cand.resumeUrl || '']
          );
        }
        console.log(`  ✔ Inserted ${mockData.candidates.length} candidates.`);
      }

      // Seed Applications
      const [appRows] = await connection.query('SELECT COUNT(*) as count FROM applications');
      if (appRows[0].count === 0 && mockData.applications) {
        console.log('Seeding applications table...');
        for (const app of mockData.applications) {
          await connection.query(
            'INSERT IGNORE INTO applications (id, candidate_id, job_id, status, match_score, applied_date) VALUES (?, ?, ?, ?, ?, ?)',
            [app.id, app.candidateId, app.jobId, app.status, app.matchScore, app.appliedDate]
          );
        }
        console.log(`  ✔ Inserted ${mockData.applications.length} job applications.`);
      }
    }

    console.log('🎉 Database setup and table creation completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
