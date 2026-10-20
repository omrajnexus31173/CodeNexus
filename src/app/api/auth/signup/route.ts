import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { hashPassword, generateSecureToken, hashToken, validatePassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit, recordRateLimitAttempt } from '@/lib/rateLimit';
import { getAppUrl, getClientIp } from '@/lib/env';

export async function POST(req: NextRequest) {
  let client;
  try {
    const body = await req.json();
    const { full_name, email, password } = body;

    // 1. Data presence validation
    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      return NextResponse.json(
        { error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Password strength validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Fail closed on email-link configuration before creating an account
    // that cannot receive a valid production verification link.
    const appUrl = getAppUrl();

    // 4. Rate limiting: max 5 signups per hour per IP / email
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit('signup', `${clientIp}:${normalizedEmail}`, 5, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many signup attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }
    await recordRateLimitAttempt('signup', `${clientIp}:${normalizedEmail}`);

    client = await getClient();

    // 5. Existing user check
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in or reset your password.' },
        { status: 409 }
      );
    }

    await client.query('BEGIN');

    // 6. Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // 7. Insert new user strictly as UNVERIFIED (is_verified = false, points = 0)
    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, is_verified, points)
       VALUES ($1, $2, $3, FALSE, 0)
       RETURNING id, full_name, email, role, points, is_verified;`,
      [full_name.trim(), normalizedEmail, passwordHash]
    );
    const newUser = userRes.rows[0];

    // 8. Generate cryptographically secure random token & store only its SHA-256 hash
    const rawVerificationToken = generateSecureToken(32);
    const tokenHash = hashToken(rawVerificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    await client.query(
      `INSERT INTO verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3);`,
      [newUser.id, tokenHash, expiresAt]
    );

    // 9. Initialize default Career Profile
    await client.query(
      `INSERT INTO career_profiles (user_id, headline, bio, career_objective)
       VALUES ($1, $2, $3, $4);`,
      [
        newUser.id,
        'Aspiring Software Engineer & Lifelong Learner',
        'Exploring programming languages, algorithms, and software design on Code Nexus.',
        'To build impactful software systems and master core computer science paradigms.'
      ]
    );

    // 10. Initial Welcome Notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4);`,
      [
        newUser.id,
        'Welcome to Code Nexus!',
        'Please verify your email address to unlock your dashboard, certifications, and compiler sandbox.',
        'system'
      ]
    );

    await client.query('COMMIT');

    // 11. Dispatch verification email via Resend API
    const verificationUrl = `${appUrl}/verify-email?token=${encodeURIComponent(rawVerificationToken)}`;

    let emailSent = false;

    try {
      const emailResult = await sendVerificationEmail({
        to: newUser.email,
        fullName: newUser.full_name,
        verificationUrl,
      });
      emailSent = emailResult.success;
    } catch {
      emailSent = false;
    }

    // 12. Return safe JSON response:
    // IMPORTANT: Never return raw verification token or authentication session cookies!
    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Account registered successfully! A verification email has been sent. Please check your inbox and verify your email before signing in.'
        : 'Account created. We attempted to send a verification email; you may request a new link if needed.',
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        is_verified: false,
      },
      emailDelivery: {
        sent: emailSent,
        details: emailSent ? 'Verification link dispatched via Resend API' : 'Pending delivery',
      },
    }, { status: 201 });
  } catch (err: any) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
