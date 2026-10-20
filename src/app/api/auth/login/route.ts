import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { checkRateLimit, recordRateLimitAttempt } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = getClientIp(req);
    const rateLimitKey = `${clientIp}:${normalizedEmail}`;

    // Rate limiting: max 5 failed attempts per 15 minutes
    const rateCheck = await checkRateLimit('login_attempt', rateLimitKey, 5, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const userRes = await query(
      `SELECT id, email, password_hash, full_name, role, is_verified, points, theme_preference, custom_bg_color
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      await recordRateLimitAttempt('login_attempt', rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      await recordRateLimitAttempt('login_attempt', rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // CRITICAL: Block unverified users from obtaining an authenticated session
    if (!user.is_verified) {
      return NextResponse.json(
        {
          error: 'Your email address is not verified yet. Please check your inbox for the verification email or request a new verification link.',
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Authenticated & verified: sign token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified,
        points: user.points,
        theme_preference: user.theme_preference,
        custom_bg_color: user.custom_bg_color,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('cn_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during login.' },
      { status: 500 }
    );
  }
}
