import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const userRes = await query(
      `SELECT id, email, full_name, role, is_verified, points, avatar_url,
              theme_preference, custom_bg_color, editor_theme, editor_font_size, created_at
       FROM users WHERE id = $1`,
      [userPayload.id]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    const user = userRes.rows[0];

    if (!user.is_verified) {
      return NextResponse.json(
        { authenticated: false, user: null, error: 'Account email is not verified.' },
        { status: 403 }
      );
    }

    // Fetch quick stats
    const progressRes = await query(
      `SELECT COUNT(*) as completed_topics FROM user_topic_progress WHERE user_id = $1 AND completed = true`,
      [user.id]
    );

    const questionsRes = await query(
      `SELECT COUNT(*) as solved_questions FROM user_question_attempts WHERE user_id = $1 AND status = 'solved'`,
      [user.id]
    );

    const certsRes = await query(
      `SELECT COUNT(*) as cert_count FROM certificates WHERE user_id = $1 AND is_valid = true`,
      [user.id]
    );

    const unlockedRes = await query(
      `SELECT COUNT(*) as unlocked_count FROM user_unlocked_resources WHERE user_id = $1`,
      [user.id]
    );

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        stats: {
          completedTopics: parseInt(progressRes.rows[0]?.completed_topics || '0', 10),
          solvedQuestions: parseInt(questionsRes.rows[0]?.solved_questions || '0', 10),
          certificatesCount: parseInt(certsRes.rows[0]?.cert_count || '0', 10),
          unlockedResources: parseInt(unlockedRes.rows[0]?.unlocked_count || '0', 10),
        },
      },
    });
  } catch (err: any) {
    console.error('Auth /me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
