import { NextResponse } from 'next/server';
import pool, { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed. Please check MySQL server and credentials.' },
        { status: 500 }
      );
    }

    // Fetch summary counts for each table
    const [hrCount]: any = await pool.query('SELECT COUNT(*) as count FROM hr_users');
    const [jobsCount]: any = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const [candCount]: any = await pool.query('SELECT COUNT(*) as count FROM candidates');
    const [appCount]: any = await pool.query('SELECT COUNT(*) as count FROM applications');
    const [resCount]: any = await pool.query('SELECT COUNT(*) as count FROM resumes');

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MySQL database!',
      database: process.env.DB_NAME || 'job_portal',
      tables: {
        hr_users: hrCount[0].count,
        jobs: jobsCount[0].count,
        candidates: candCount[0].count,
        applications: appCount[0].count,
        resumes: resCount[0].count,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
