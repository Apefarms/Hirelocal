import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email exists
    const [existing]: any = await pool.query(
      'SELECT id FROM candidates WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please login instead.' },
        { status: 400 }
      );
    }

    const newId = `cand-${Date.now()}`;
    await pool.query(
      'INSERT INTO candidates (id, name, phone, email, password, education, experience, skills, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, name, phone || '', email, password, '', '', JSON.stringify([]), '']
    );

    const newCandidate = {
      id: newId,
      name,
      phone: phone || '',
      email,
      password,
      education: '',
      experience: '',
      skills: [],
      resumeUrl: '',
      appliedJobIds: [],
    };

    return NextResponse.json({ success: true, candidate: newCandidate }, { status: 201 });
  } catch (error: any) {
    console.error('Error in candidate signup:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
