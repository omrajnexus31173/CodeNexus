import { NextRequest, NextResponse } from 'next/server';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function requestHosts(req: NextRequest): Set<string> {
  const hosts = new Set<string>();
  const add = (value: string | null) => {
    if (!value) return;
    for (const part of value.split(',')) {
      const host = part.trim().toLowerCase();
      if (host) hosts.add(host);
    }
  };

  // Forwarded hosts are client-controllable unless a trusted reverse proxy
  // overwrites them. Accept them only when the operator explicitly opts in.
  if (process.env.TRUST_PROXY_HEADERS === 'true') {
    add(req.headers.get('x-forwarded-host'));
  }
  add(req.headers.get('host'));
  add(req.nextUrl.host);
  return hosts;
}

/**
 * Defense-in-depth CSRF check for browser-originated unsafe API calls.
 * Non-browser API clients normally omit Origin/Sec-Fetch-Site and use an
 * Authorization header; browsers send at least one of these signals.
 */
export function middleware(req: NextRequest) {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return NextResponse.next();
  }

  const fetchSite = req.headers.get('sec-fetch-site')?.toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site' && fetchSite !== 'none') {
    return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  }

  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (!requestHosts(req).has(originHost)) {
        return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid Origin header.' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
