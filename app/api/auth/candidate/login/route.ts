import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { phone, email, password } = await request.json();

    let candidate = null;

    if (email) {
      const [rows]: any = await pool.query(
        'SELECT * FROM candidates WHERE LOWER(email) = LOWER(?)',
        [email]
      );
      if (rows.length > 0) {
        candidate = rows[0];
      }
    } else if (phone) {
      const [rows]: any = await pool.query(
        'SELECT * FROM candidates WHERE phone = ?',
        [phone]
      );
      if (rows.length > 0) {
        candidate = rows[0];
      } else {
        // Create new candidate stub if logging in via phone for the first time
        const newId = `cand-${Date.now()}`;
        await pool.query(
          'INSERT INTO candidates (id, name, phone, email, password, education, experience, skills, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newId, '', phone, '', '', '', '', JSON.stringify([]), '']
        );
        const [created]: any = await pool.query('SELECT * FROM candidates WHERE id = ?', [newId]);
        candidate = created[0];
      }
    }

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate not found' }, { status: 404 });
    }

    // Fetch applied job IDs for candidate
    const [appRows]: any = await pool.query(
      'SELECT job_id FROM applications WHERE candidate_id = ?',
      [candidate.id]
    );

    const formattedCandidate = {
      id: candidate.id,
      name: candidate.name,
      phone: candidate.phone,
      email: candidate.email,
      password: candidate.password,
      education: candidate.education || '',
      experience: candidate.experience || '',
      skills: typeof candidate.skills === 'string' ? JSON.parse(candidate.skills) : (candidate.skills || []),
      resumeUrl: candidate.resume_url || '',
      appliedJobIds: appRows.map((row: any) => row.job_id),
    };

    return NextResponse.json({ success: true, candidate: formattedCandidate });
  } catch (error: any) {
    console.error('Error in candidate login:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
