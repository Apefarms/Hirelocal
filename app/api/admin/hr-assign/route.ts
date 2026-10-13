import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/admin/hr-assign - Retrieve all HR account requests
export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, name, company, phone, email, status, created_at as createdAt FROM hr_users ORDER BY created_at DESC'
    );

    return NextResponse.json({
      success: true,
      hrRequests: rows,
    });
  } catch (error: any) {
    console.error('Error fetching HR requests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/hr-assign - Assign (approve) or reject HR account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hrId, action } = body;

    if (!hrId || !action || !['assign', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid hrId and action ("assign" or "reject") are required' },
        { status: 400 }
      );
    }

    const newStatus = action === 'assign' ? 'approved' : 'rejected';

    const [result]: any = await pool.query(
      'UPDATE hr_users SET status = ? WHERE id = ?',
      [newStatus, hrId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: `HR account with ID ${hrId} not found` },
        { status: 404 }
      );
    }

    const [updatedRows]: any = await pool.query(
      'SELECT id, name, company, phone, email, status, created_at as createdAt FROM hr_users WHERE id = ?',
      [hrId]
    );

    return NextResponse.json({
      success: true,
      message: action === 'assign'
        ? `HR account for ${updatedRows[0]?.company || 'user'} has been successfully assigned and approved.`
        : `HR account request for ${updatedRows[0]?.company || 'user'} has been rejected.`,
      hrUser: updatedRows[0],
    });
  } catch (error: any) {
    console.error('Error in HR assign action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
