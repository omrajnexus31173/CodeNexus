import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Liveness probe. This intentionally does not touch PostgreSQL or any
 * external service, so process-level health can be distinguished from
 * dependency readiness at /api/health/ready.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'code-nexus',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
