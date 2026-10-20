import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { generateSecureToken, hashToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
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

    // 1. Rate limiting: max 3 resend attempts per 10 minutes (600 seconds) per IP/email
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit('resend_verification', `${clientIp}:${normalizedEmail}`, 3, 600);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification requests. Please wait ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes before requesting another verification email.`,
        },
        { status: 429 }
      );
    }
    await recordRateLimitAttempt('resend_verification', `${clientIp}:${normalizedEmail}`);
    const appUrl = getAppUrl();

    client = await getClient();

    // 2. Fetch user
    const userRes = await client.query(
      `SELECT id, email, full_name, is_verified FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    // Generic safe response to avoid account enumeration
    const safeGenericResponse = {
      success: true,
      message: 'If an unverified account exists for this email address, a new verification link has been sent.',
    };

    if (userRes.rows.length === 0) {
      return NextResponse.json(safeGenericResponse);
    }

    const user = userRes.rows[0];

    // If already verified, inform user safely
    if (user.is_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'This account is already verified. You can sign in directly.',
      });
    }

    await client.query('BEGIN');

    // 3. Invalidate existing pending tokens
    await client.query(
      `UPDATE verification_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    // 4. Generate new token & insert hash
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await client.query(
      `INSERT INTO verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    await client.query('COMMIT');

    // 5. Send email via Resend
    const verificationUrl = `${appUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendVerificationEmail({
        to: user.email,
        fullName: user.full_name,
        verificationUrl,
      });
    } catch (sendErr) {
      console.error('Failed to dispatch verification email:', sendErr);
    }

    return NextResponse.json(safeGenericResponse);
  } catch (err: any) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Resend verification error:', err);
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
