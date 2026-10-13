import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM hr_users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'HR user not found' }, { status: 404 });
    }

    const hrUser = rows[0];

    // Check account approval status
    if (hrUser.status === 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Your HR account is pending Admin approval. Please wait until your account is assigned.',
        status: 'pending'
      }, { status: 403 });
    }

    if (hrUser.status === 'rejected') {
      return NextResponse.json({
        success: false,
        error: 'Your HR account registration request was rejected by the Admin.',
        status: 'rejected'
      }, { status: 403 });
    }

    // Fetch jobs posted by this HR user
    const [jobRows]: any = await pool.query(
      'SELECT id FROM jobs WHERE hr_id = ?',
      [hrUser.id]
    );

    const formattedHR = {
      id: hrUser.id,
      name: hrUser.name,
      company: hrUser.company,
      phone: hrUser.phone || '',
      email: hrUser.email,
      password: hrUser.password,
      status: hrUser.status || 'approved',
      jobIds: jobRows.map((row: any) => row.id),
    };

    return NextResponse.json({ success: true, hrUser: formattedHR });
  } catch (error: any) {
    console.error('Error in HR login:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
