import { NextResponse } from 'next/server';
import { checkDatabaseConnection, isDatabaseConfigured } from '@/lib/db';
import { safeErrorForLog } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Readiness probe. The response never includes a connection string, host,
 * credential, provider error, or other configuration value.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        status: 'not_ready',
        service: 'code-nexus',
        checks: { database: 'not_configured' },
        timestamp,
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  try {
    await checkDatabaseConnection();
    return NextResponse.json(
      {
        status: 'ready',
        service: 'code-nexus',
        checks: { database: 'ok' },
        timestamp,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (error) {
    console.error('Database readiness check failed:', safeErrorForLog(error));
    return NextResponse.json(
      {
        status: 'not_ready',
        service: 'code-nexus',
        checks: { database: 'unavailable' },
        timestamp,
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
