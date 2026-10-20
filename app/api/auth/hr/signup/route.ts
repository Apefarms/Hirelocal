import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, company, phone, email, password } = await request.json();

    if (!name || !company || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, company, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists in hr_users table
    const [existing]: any = await pool.query(
      'SELECT id FROM hr_users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An HR account with this email already exists. Please login instead.' },
        { status: 400 }
      );
    }

    const newId = `hr-${Date.now()}`;
    await pool.query(
      'INSERT INTO hr_users (id, name, company, phone, email, password, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newId, name, company, phone || '', email, password, 'approved']
    );

    const newHR = {
      id: newId,
      name,
      company,
      phone: phone || '',
      email,
      password,
      status: 'approved',
      jobIds: [],
    };

    return NextResponse.json({
      success: true,
      pendingApproval: false,
      message: 'HR account created successfully.',
      hrUser: newHR
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in HR signup:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
