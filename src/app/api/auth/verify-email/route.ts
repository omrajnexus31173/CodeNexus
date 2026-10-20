import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { hashToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let client;
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { error: 'A valid verification token is required.' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);
    client = await getClient();

    await client.query('BEGIN');

    // 1. Atomically lock and fetch token record
    const tokenRes = await client.query(
      `SELECT vt.id, vt.user_id, vt.expires_at, vt.used_at, u.id as user_id, u.email, u.full_name, u.is_verified
       FROM verification_tokens vt
       JOIN users u ON vt.user_id = u.id
       WHERE vt.token_hash = $1
       FOR UPDATE OF vt`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Invalid or unrecognized verification token.' },
        { status: 400 }
      );
    }

    const record = tokenRes.rows[0];

    // 2. Check if already used
    if (record.used_at !== null) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          error: 'This verification token has already been used. If your account is verified, you can sign in directly.',
          alreadyUsed: true,
        },
        { status: 400 }
      );
    }

    // 3. Check expiration
    const expiresAtMs = new Date(record.expires_at).getTime();
    if (Date.now() > expiresAtMs) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          error: 'This verification token has expired. Please request a new verification email.',
          expired: true,
        },
        { status: 400 }
      );
    }

    // 4. Atomically consume token
    await client.query(
      `UPDATE verification_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [record.id]
    );

    // 5. Mark user as verified
    await client.query(
      `UPDATE users
       SET is_verified = TRUE, updated_at = NOW()
       WHERE id = $1`,
      [record.user_id]
    );

    // 6. Invalidate any remaining old tokens for this user
    await client.query(
      `UPDATE verification_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND id != $2 AND used_at IS NULL`,
      [record.user_id, record.id]
    );

    // Add confirmation notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        record.user_id,
        'Email Address Verified',
        'Your email address has been verified successfully. Full access to courses, practice challenges, and certifications is now unlocked.',
        'system',
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified! Your account is active. Please proceed to sign in.',
      email: record.email,
    });
  } catch (err: any) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Email verification error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during email verification.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
