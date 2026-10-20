import { query } from './db';
import { safeErrorForLog } from './env';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

// In-memory sliding window cache for fast checks and resilience
interface AttemptRecord {
  timestamps: number[];
}
const memoryCache = new Map<string, AttemptRecord>();

export async function checkRateLimit(
  action: string,
  identifier: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900 // 15 minutes default
): Promise<RateLimitResult> {
  const key = `${action}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  // 1. In-memory check
  let memRecord = memoryCache.get(key);
  if (memRecord) {
    memRecord.timestamps = memRecord.timestamps.filter((ts) => ts > cutoff);
  } else {
    memRecord = { timestamps: [] };
    memoryCache.set(key, memRecord);
  }

  // 2. Database check (authoritative persistence)
  try {
    const dbRes = await query(
      `SELECT COUNT(*) as count, MIN(created_at) as oldest
       FROM rate_limits
       WHERE action = $1 AND identifier = $2 AND created_at > NOW() - ($3 || ' seconds')::INTERVAL`,
      [action, identifier.toLowerCase().trim(), windowSeconds.toString()]
    );

    const dbCount = parseInt(dbRes.rows[0]?.count || '0', 10);
    const totalCount = Math.max(dbCount, memRecord.timestamps.length);

    if (totalCount >= maxAttempts) {
      const oldestTime = dbRes.rows[0]?.oldest
        ? new Date(dbRes.rows[0].oldest).getTime()
        : memRecord.timestamps[0] || cutoff;
      const elapsedSeconds = Math.max(0, Math.floor((now - oldestTime) / 1000));
      const retryAfterSeconds = Math.max(1, windowSeconds - elapsedSeconds);

      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - totalCount - 1),
      retryAfterSeconds: 0,
    };
  } catch (err) {
    // If database table is temporarily unavailable, fall back to memory cache
    console.warn('Database rate_limits lookup warning, using in-memory limiter:', safeErrorForLog(err));
    if (memRecord.timestamps.length >= maxAttempts) {
      const oldest = memRecord.timestamps[0] || cutoff;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, maxAttempts - memRecord.timestamps.length - 1),
      retryAfterSeconds: 0,
    };
  }
}

export async function recordRateLimitAttempt(
  action: string,
  identifier: string
): Promise<void> {
  const key = `${action}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  let memRecord = memoryCache.get(key);
  if (!memRecord) {
    memRecord = { timestamps: [] };
    memoryCache.set(key, memRecord);
  }
  memRecord.timestamps.push(now);

  try {
    await query(
      `INSERT INTO rate_limits (action, identifier, created_at)
       VALUES ($1, $2, NOW())`,
      [action, identifier.toLowerCase().trim()]
    );
  } catch (err) {
    // Non-fatal, memory limiter still records it
    console.warn('Could not record rate limit attempt in DB:', safeErrorForLog(err));
  }
}
