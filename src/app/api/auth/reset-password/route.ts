import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { hashPassword, hashToken, validatePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let client;
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json(
        { error: 'Password reset token is required.' },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    client = await getClient();

    await client.query('BEGIN');

    // 1. Fetch token record with lock
    const tokenRes = await client.query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at, u.email, u.full_name
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token_hash = $1
       FOR UPDATE OF prt`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Invalid or unrecognized password reset link.' },
        { status: 400 }
      );
    }

    const record = tokenRes.rows[0];

    // 2. Check if already used
    if (record.used_at !== null) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'This password reset link has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (Date.now() > new Date(record.expires_at).getTime()) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 4. Hash new password
    const newHash = await hashPassword(password);

    // 5. Update user password
    await client.query(
      `UPDATE users
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [newHash, record.user_id]
    );

    // 6. Mark token as used
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [record.id]
    );

    // 7. Revoke all other reset tokens for this user
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND id != $2 AND used_at IS NULL`,
      [record.user_id, record.id]
    );

    // 8. Add security audit notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)`,
      [
        record.user_id,
        'Password Changed Successfully',
        'Your account password was updated. If you did not make this change, please contact support immediately.',
        'system',
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (err: any) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Reset password error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred during password reset.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
