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

// POST /api/admin/hr-assign - Approve/restore or revoke HR account access
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hrId, action } = body;

    const allowedActions = ['assign', 'approve', 'restore', 'reject', 'revoke'];
    if (!hrId || !action || !allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid hrId and action ("assign", "approve", "restore", "revoke", or "reject") are required' },
        { status: 400 }
      );
    }

    const isRevoke = action === 'revoke' || action === 'reject';
    const newStatus = isRevoke ? 'rejected' : 'approved';

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
      message: isRevoke
        ? `HR account access for ${updatedRows[0]?.name || 'user'} (${updatedRows[0]?.company || 'Company'}) has been revoked.`
        : `HR account access for ${updatedRows[0]?.name || 'user'} (${updatedRows[0]?.company || 'Company'}) has been granted/restored.`,
      hrUser: updatedRows[0],
    });
  } catch (error: any) {
    console.error('Error in HR assign action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
