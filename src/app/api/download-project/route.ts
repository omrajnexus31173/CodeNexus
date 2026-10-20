import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  // A full source/evidence archive is not a public production asset unless
  // the operator explicitly chooses to publish it.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SOURCE_DOWNLOAD !== 'true') {
    return NextResponse.json({ error: 'Archive file not found.' }, { status: 404 });
  }

  // Only serve an archive that an operator has deliberately placed in the
  // application's public directory. Never fall back to a machine-specific
  // workspace path.
  const targetPath = path.resolve(process.cwd(), 'public/code-nexus-production.zip');

  if (!fs.existsSync(targetPath)) {
    return NextResponse.json({ error: 'Archive file not found.' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(targetPath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="code-nexus-production.zip"',
      'Content-Length': fileBuffer.length.toString(),
    },
  });
}
