import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/applications - Fetch applications (supports filtering by candidateId or jobId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const jobId = searchParams.get('jobId');

    let sql = `
      SELECT 
        a.id, 
        a.candidate_id as candidateId, 
        a.job_id as jobId, 
        a.status, 
        a.match_score as matchScore, 
        a.applied_date as appliedDate,
        c.name as candidateName,
        c.email as candidateEmail,
        c.phone as candidatePhone,
        c.education as candidateEducation,
        c.experience as candidateExperience,
        CASE WHEN c.resume LIKE '/resumes/%' THEN NULL ELSE c.resume END as candidateResume,
        CASE WHEN c.resume LIKE '/resumes/%' THEN NULL ELSE c.resume END as candidateResumeUrl,
        j.title as jobTitle,
        j.company as jobCompany
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      JOIN jobs j ON a.job_id = j.id
    `;
    const params: any[] = [];

    if (candidateId) {
      sql += ' WHERE a.candidate_id = ?';
      params.push(candidateId);
    } else if (jobId) {
      sql += ' WHERE a.job_id = ?';
      params.push(jobId);
    }

    sql += ' ORDER BY a.created_at DESC';

    const [rows]: any = await pool.query(sql, params);

    const applications = rows.map((app: any) => ({
      ...app,
      candidateSkills: typeof app.candidateSkills === 'string' ? JSON.parse(app.candidateSkills) : (app.candidateSkills || []),
    }));

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/applications - Create a new job application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, jobId, matchScore, candidateData } = body;

    if (!candidateId || !jobId) {
      return NextResponse.json({ success: false, error: 'candidateId and jobId are required' }, { status: 400 });
    }

    // 1. Update candidate profile if candidateData is provided
    if (candidateData) {
      const skillsJson = JSON.stringify(candidateData.skills || []);
      const resumeValue = candidateData.uploadedResumePath || candidateData.resume || candidateData.resumeUrl || '';
      await pool.query(
        `UPDATE candidates SET 
          name = COALESCE(NULLIF(?, ''), name),
          email = COALESCE(NULLIF(?, ''), email),
          education = COALESCE(NULLIF(?, ''), education),
          experience = COALESCE(NULLIF(?, ''), experience),
          skills = ?,
          resume = COALESCE(NULLIF(?, ''), resume),
          resume_url = COALESCE(NULLIF(?, ''), resume_url)
        WHERE id = ?`,
        [
          candidateData.name || '',
          candidateData.email || '',
          candidateData.education || '',
          candidateData.experience || '',
          skillsJson,
          resumeValue,
          resumeValue,
          candidateId,
        ]
      );
    }

    // 2. Insert application row into MySQL
    const id = `app-${Date.now()}`;
    const appliedDate = new Date().toISOString().split('T')[0];
    const score = matchScore !== undefined ? matchScore : 75;

    await pool.query(
      'INSERT INTO applications (id, candidate_id, job_id, status, match_score, applied_date) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), match_score = VALUES(match_score)',
      [id, candidateId, jobId, 'applied', score, appliedDate]
    );

    const newApp = {
      id,
      candidateId,
      jobId,
      status: 'applied',
      matchScore: score,
      appliedDate,
    };

    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating application:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/applications - Update application status (shortlisted or rejected)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !['shortlisted', 'rejected', 'applied'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid applicationId or status' }, { status: 400 });
    }

    await pool.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    return NextResponse.json({ success: true, applicationId, status });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
