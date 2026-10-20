import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userPayload = await requireAdminUser(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const totalUsersRes = await query('SELECT COUNT(*) as count FROM users');
    const totalQuestionsRes = await query('SELECT COUNT(*) as count FROM questions');
    const totalSolvedRes = await query('SELECT COUNT(*) as count FROM user_question_attempts WHERE status = \'solved\'');
    const totalCertsRes = await query('SELECT COUNT(*) as count FROM certificates WHERE is_valid = true');
    const totalPointsRes = await query('SELECT COALESCE(SUM(points), 0) as total FROM users');
    const totalUnlockedRes = await query('SELECT COUNT(*) as count FROM user_unlocked_resources');

    // Popular courses
    const popularCoursesRes = await query(`
      SELECT c.id, c.title, COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN user_course_enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY enrollment_count DESC
      LIMIT 5;
    `);

    // Recent audit logs
    const recentAuditRes = await query(`
      SELECT * FROM point_ledger ORDER BY created_at DESC LIMIT 10;
    `);

    return NextResponse.json({
      stats: {
        totalUsers: parseInt(totalUsersRes.rows[0].count, 10),
        totalQuestions: parseInt(totalQuestionsRes.rows[0].count, 10),
        totalSolved: parseInt(totalSolvedRes.rows[0].count, 10),
        totalCertificates: parseInt(totalCertsRes.rows[0].count, 10),
        totalPoints: parseInt(totalPointsRes.rows[0].total, 10),
        totalUnlockedResources: parseInt(totalUnlockedRes.rows[0].count, 10),
      },
      popularCourses: popularCoursesRes.rows,
      recentLedger: recentAuditRes.rows,
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 });
  }
}
