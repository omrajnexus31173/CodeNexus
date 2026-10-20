import type { NextRequest } from 'next/server';

const PLACEHOLDER_PATTERNS = [
  /replace_with/i,
  /your_/i,
  /example/i,
  /change[_-]?me/i,
  /development[_-]?fallback/i,
  /super[_-]?safe/i,
  /username:password/i,
];

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isPlaceholderValue(value: string | undefined | null): boolean {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

/**
 * Canonical public application URL used in email links and certificate QR
 * codes. Production must configure it explicitly; loopback HTTP is accepted
 * only for local production-build testing, never as a silent public default.
 */
export function getAppUrl(): string {
  const raw = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').trim();

  if (!raw || isPlaceholderValue(raw)) {
    if (isProduction()) {
      throw new Error('APP_URL (or NEXT_PUBLIC_APP_URL) must be configured in production.');
    }
    return 'http://localhost:3000';
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('APP_URL (or NEXT_PUBLIC_APP_URL) must be a valid absolute URL.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('APP_URL must use http:// or https://.');
  }

  if (isProduction() && parsed.protocol !== 'https:' && !isLoopbackHost(parsed.hostname)) {
    throw new Error('APP_URL must use https:// in production (loopback is allowed only for local testing).');
  }

  return parsed.toString().replace(/\/+$/, '');
}

/**
 * Client identifier for rate limiting. Forwarded headers are spoofable when
 * the app is directly exposed, so they are trusted only when the deployment
 * explicitly declares a trusted reverse proxy.
 */
export function getClientIp(req: NextRequest): string {
  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
    const realIp = req.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;
  }
  return 'direct';
}

/** Redacts credential-bearing URLs/tokens before an error is written to logs. */
export function safeErrorForLog(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s'"]+/gi, 'postgresql://<redacted>')
    .replace(/\bre_[A-Za-z0-9_-]+\b/g, '<redacted-resend-key>')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer <redacted>')
    .slice(0, 500);
}
