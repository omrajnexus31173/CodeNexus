import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userPayload = await requireAdminUser(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Access denied: Admin privileges required.' }, { status: 403 });
  }

  try {
    const usersRes = await query(`
      SELECT 
        u.id, u.email, u.full_name, u.role, u.is_verified, u.points, u.created_at,
        COUNT(DISTINCT c.id) as certificates_count,
        COUNT(DISTINCT a.id) as questions_solved
      FROM users u
      LEFT JOIN certificates c ON u.id = c.user_id AND c.is_valid = true
      LEFT JOIN user_question_attempts a ON u.id = a.user_id AND a.status = 'solved'
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `);

    return NextResponse.json({ users: usersRes.rows });
  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userPayload = await requireAdminUser(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }

  try {
    const { userId, role, is_verified, points } = await req.json();
    const parsedUserId = Number(userId);
    const parsedPoints = points === undefined || points === null ? null : Number(points);

    if (!Number.isInteger(parsedUserId) || parsedUserId < 1) {
      return NextResponse.json({ error: 'A valid userId is required.' }, { status: 400 });
    }
    if (role !== undefined && role !== null && !['student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'role must be student or admin.' }, { status: 400 });
    }
    if (is_verified !== undefined && is_verified !== null && typeof is_verified !== 'boolean') {
      return NextResponse.json({ error: 'is_verified must be a boolean.' }, { status: 400 });
    }
    if (parsedPoints !== null && (!Number.isInteger(parsedPoints) || parsedPoints < 0)) {
      return NextResponse.json({ error: 'points must be a non-negative integer.' }, { status: 400 });
    }

    const updateRes = await query(
      `UPDATE users
       SET role = COALESCE($1, role),
           is_verified = COALESCE($2, is_verified),
           points = COALESCE($3, points),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id`,
      [role ?? null, is_verified ?? null, parsedPoints, parsedUserId]
    );
    if (updateRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    console.error('Admin user update error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
