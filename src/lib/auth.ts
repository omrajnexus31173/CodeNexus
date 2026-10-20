import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { isPlaceholderValue, isProduction } from './env';

const globalForAuth = globalThis as typeof globalThis & {
  __codeNexusDevJwtSecret?: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret && !isPlaceholderValue(secret)) {
    if (isProduction() && secret.length < 32) {
      throw new Error(
        'FATAL SECURITY CONFIGURATION: JWT_SECRET must be at least 32 characters in production.'
      );
    }
    return secret;
  }

  if (isProduction()) {
    throw new Error(
      'FATAL SECURITY CONFIGURATION: A secure, unique JWT_SECRET of at least 32 characters must be configured in production.'
    );
  }

  // Development convenience only: an ephemeral per-process secret, never a
  // predictable hard-coded value. Tokens intentionally do not survive a
  // server restart when JWT_SECRET is not configured locally.
  if (!globalForAuth.__codeNexusDevJwtSecret) {
    globalForAuth.__codeNexusDevJwtSecret = crypto.randomBytes(32).toString('hex');
    console.warn('JWT_SECRET is not configured; using an ephemeral development-only secret.');
  }
  return globalForAuth.__codeNexusDevJwtSecret;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  // bcrypt only consumes the first 72 bytes; reject longer passwords rather
  // than silently truncating the credential the user thinks they selected.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password must be no more than 72 bytes when encoded as UTF-8.';
  }
  return null;
}

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  full_name: string;
}

export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256', expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Computes a deterministic SHA-256 hash of a single-use token
 * so the raw token is NEVER persisted in the database.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Generates a cryptographically secure, unpredictable random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // 2. Check Cookie
  const cookieToken = request.cookies.get('cn_auth_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

/**
 * Admin authorization is checked against the current database row, not only
 * the role claim embedded when the JWT was issued. This prevents a demoted
 * or unverified account from retaining admin access until token expiry.
 */
export async function requireAdminUser(request: NextRequest): Promise<TokenPayload | null> {
  const payload = getUserFromRequest(request);
  if (!payload) return null;

  const { query } = await import('./db');
  const result = await query('SELECT role, is_verified FROM users WHERE id = $1', [payload.id]);
  const current = result.rows[0];
  if (!current || current.role !== 'admin' || !current.is_verified) return null;

  return { ...payload, role: current.role };
}
