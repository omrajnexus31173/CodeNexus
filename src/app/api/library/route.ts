import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);

    const resourcesRes = await query(`
      SELECT 
        id, title, course_id, language, category, difficulty, author,
        description, file_size, pages_or_read_time, unlock_cost,
        content_summary, is_premium, created_at
      FROM library_resources
      ORDER BY category ASC, title ASC;
    `);

    let unlockedSet = new Set<string>();
    let userPoints = 0;

    if (userPayload) {
      const unlockedRes = await query(
        `SELECT resource_id FROM user_unlocked_resources WHERE user_id = $1`,
        [userPayload.id]
      );
      unlockedRes.rows.forEach((r) => unlockedSet.add(r.resource_id));

      const userRes = await query(`SELECT points FROM users WHERE id = $1`, [userPayload.id]);
      if (userRes.rows.length > 0) {
        userPoints = userRes.rows[0].points;
      }
    }

    const resources = resourcesRes.rows.map((res) => ({
      ...res,
      isUnlocked: unlockedSet.has(res.id),
      canUnlock: userPoints >= res.unlock_cost,
    }));

    return NextResponse.json({
      resources,
      userPoints,
      unlockedCount: unlockedSet.size,
    });
  } catch (err: any) {
    console.error('Library GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch library resources' }, { status: 500 });
  }
}
