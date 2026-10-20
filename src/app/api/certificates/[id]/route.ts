import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certRes = await query(
      `SELECT c.*
       FROM certificates c
       WHERE c.id = $1`,
      [id]
    );

    if (certRes.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Certificate not found' }, { status: 404 });
    }

    const cert = certRes.rows[0];

    return NextResponse.json({
      valid: cert.is_valid,
      certificate: {
        id: cert.id,
        recipient_name: cert.recipient_name,
        course_title: cert.course_title,
        score_percent: cert.score_percent,
        issue_date: cert.issue_date,
        is_valid: cert.is_valid,
        qr_code_data: cert.qr_code_data,
        issuer: 'Code Nexus Global Technical Academy',
        verified: true,
      },
    });
  } catch (err: any) {
    console.error('Certificate verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
