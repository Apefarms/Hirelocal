import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/jobs - Fetch all jobs from MySQL
export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, title, company, location, description, requirements, posted_date as postedDate, salary, hr_id as hrId, extra_message as extraMessage FROM jobs ORDER BY created_at DESC'
    );

    // Format requirements JSON for each job
    const jobs = rows.map((job: any) => ({
      ...job,
      requirements: typeof job.requirements === 'string' ? JSON.parse(job.requirements) : (job.requirements || []),
    }));

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job in MySQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, company, location, description, requirements, salary, hrId, extraMessage, extra_message } = body;

    if (!title || !company || !location || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (hrId) {
      const [hrRows]: any = await pool.query('SELECT status FROM hr_users WHERE id = ?', [hrId]);
      if (hrRows.length > 0 && hrRows[0].status === 'rejected') {
        return NextResponse.json(
          { success: false, error: 'Your HR account access has been revoked by the Administrator.' },
          { status: 403 }
        );
      }
    }

    const id = `job-${Date.now()}`;
    const postedDate = new Date().toISOString().split('T')[0];
    const reqJson = JSON.stringify(requirements || []);
    const finalExtraMessage = (extraMessage || extra_message || '').trim() || null;

    await pool.query(
      'INSERT INTO jobs (id, title, company, location, description, requirements, posted_date, salary, hr_id, extra_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, company, location, description, reqJson, postedDate, salary || 'Not specified', hrId || null, finalExtraMessage]
    );

    const newJob = {
      id,
      title,
      company,
      location,
      description,
      requirements: requirements || [],
      postedDate,
      salary: salary || 'Not specified',
      hrId: hrId || null,
      extraMessage: finalExtraMessage || undefined,
    };

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
