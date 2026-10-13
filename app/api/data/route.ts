import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // 1. Jobs
    const [jobRows]: any = await pool.query(
      'SELECT id, title, company, location, description, requirements, posted_date as postedDate, salary, extra_message as extraMessage FROM jobs ORDER BY created_at DESC'
    );
    const jobs = jobRows.map((j: any) => ({
      ...j,
      requirements: typeof j.requirements === 'string' ? JSON.parse(j.requirements) : (j.requirements || []),
    }));

    // 2. Candidates & their applied job IDs
    const [candRows]: any = await pool.query('SELECT * FROM candidates');
    const [appRows]: any = await pool.query('SELECT id, candidate_id as candidateId, job_id as jobId, status, match_score as matchScore, applied_date as appliedDate FROM applications');

    const candidates = candRows.map((c: any) => {
      const appliedJobIds = appRows
        .filter((app: any) => app.candidateId === c.id)
        .map((app: any) => app.jobId);

      const realResume = (c.resume && !c.resume.startsWith('/resumes/'))
        ? c.resume
        : (c.resume_url && !c.resume_url.startsWith('/resumes/') ? c.resume_url : '');

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        password: c.password,
        education: c.education || '',
        experience: c.experience || '',
        skills: typeof c.skills === 'string' ? JSON.parse(c.skills) : (c.skills || []),
        resumeUrl: realResume,
        resume: realResume,
        appliedJobIds,
      };
    });

    // 3. HR Users & their job IDs
    const [hrRows]: any = await pool.query('SELECT * FROM hr_users');
    const hrUsers = hrRows.map((hr: any) => {
      const jobIds = jobs.filter((j: any) => j.company === hr.company).map((j: any) => j.id);
      return {
        id: hr.id,
        name: hr.name,
        company: hr.company,
        phone: hr.phone || '',
        email: hr.email,
        password: hr.password,
        status: hr.status || 'approved',
        createdAt: hr.created_at,
        jobIds,
      };
    });

    // 4. Applications
    const applications = appRows.map((app: any) => ({
      id: app.id,
      candidateId: app.candidateId,
      jobId: app.jobId,
      status: app.status,
      matchScore: app.matchScore,
      appliedDate: app.appliedDate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        candidates,
        applications,
        hrUsers,
      },
    });
  } catch (error: any) {
    console.error('Error loading data from MySQL:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
