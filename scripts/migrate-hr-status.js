const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const mysql = require('mysql2/promise');

async function migrate() {
  const isSsl =
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL === '1' ||
    (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'));

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_portal',
    ssl: isSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  });

  const [cols] = await conn.query('SHOW COLUMNS FROM hr_users');
  const hasStatus = cols.some(c => c.Field === 'status');
  if (!hasStatus) {
    await conn.query("ALTER TABLE hr_users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'");
    console.log('✔ Added status column to hr_users');
  } else {
    console.log('✔ status column already exists in hr_users');
  }

  const [rows] = await conn.query('SELECT id, name, company, email, status FROM hr_users');
  console.log('Current hr_users:', rows);

  await conn.end();
}

migrate().catch(console.error);
