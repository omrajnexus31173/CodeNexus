import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({
      theme_preference: 'dark',
      custom_bg_color: '#0a0f1d',
      editor_theme: 'vs-dark',
      editor_font_size: 14,
    });
  }

  try {
    const res = await query(
      `SELECT theme_preference, custom_bg_color, editor_theme, editor_font_size FROM users WHERE id = $1`,
      [userPayload.id]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({
        theme_preference: 'dark',
        custom_bg_color: '#0a0f1d',
        editor_theme: 'vs-dark',
        editor_font_size: 14,
      });
    }

    return NextResponse.json(res.rows[0]);
  } catch (err: any) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { theme_preference, custom_bg_color, editor_theme, editor_font_size } = await req.json();

    await query(
      `UPDATE users
       SET theme_preference = COALESCE($1, theme_preference),
           custom_bg_color = COALESCE($2, custom_bg_color),
           editor_theme = COALESCE($3, editor_theme),
           editor_font_size = COALESCE($4, editor_font_size),
           updated_at = NOW()
       WHERE id = $5`,
      [theme_preference, custom_bg_color, editor_theme, editor_font_size, userPayload.id]
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
