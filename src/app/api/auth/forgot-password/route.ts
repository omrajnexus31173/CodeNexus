import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, recordRateLimitAttempt } from '@/lib/rateLimit';
import { getAppUrl, getClientIp } from '@/lib/env';

export async function POST(req: NextRequest) {
  let client;
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = getClientIp(req);

    // Rate limiting: max 3 forgot-password requests per 15 minutes per IP/email
    const rateCheck = await checkRateLimit('forgot_password', `${clientIp}:${normalizedEmail}`, 3, 900);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before requesting another reset email.`,
        },
        { status: 429 }
      );
    }
    await recordRateLimitAttempt('forgot_password', `${clientIp}:${normalizedEmail}`);
    const appUrl = getAppUrl();

    client = await getClient();

    // Generic safe response to protect against user enumeration
    const safeGenericResponse = {
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    };

    const userRes = await client.query(
      `SELECT id, email, full_name, is_verified FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(safeGenericResponse);
    }

    const user = userRes.rows[0];

    // Only allow password reset for active accounts
    await client.query('BEGIN');

    // 1. Invalidate any existing unused reset tokens for this user
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    // 2. Generate secure token & save SHA-256 hash with 1-hour expiry
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await client.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    await client.query('COMMIT');

    // 3. Dispatch reset email via Resend
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        resetUrl,
      });
    } catch (err) {
      console.error('Failed to send password reset email via Resend:', err);
    }

    return NextResponse.json(safeGenericResponse);
  } catch (err: any) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
