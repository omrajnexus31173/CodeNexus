import { NextRequest, NextResponse } from 'next/server';
import { getClient, query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { adjustPointsWithLedger } from '@/lib/db';

export async function POST(req: NextRequest) {
  const userPayload = getUserFromRequest(req);
  if (!userPayload) {
    return NextResponse.json({ error: 'Please log in to unlock library resources.' }, { status: 401 });
  }

  const client = await getClient();
  try {
    const { resource_id } = await req.json();

    if (!resource_id) {
      return NextResponse.json({ error: 'resource_id is required' }, { status: 400 });
    }

    // Check resource existence
    const resRes = await query('SELECT * FROM library_resources WHERE id = $1', [resource_id]);
    if (resRes.rows.length === 0) {
      return NextResponse.json({ error: 'Library resource not found.' }, { status: 404 });
    }
    const resource = resRes.rows[0];

    // Check if already unlocked
    const alreadyUnlocked = await query(
      'SELECT id FROM user_unlocked_resources WHERE user_id = $1 AND resource_id = $2',
      [userPayload.id, resource_id]
    );
    if (alreadyUnlocked.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Resource is already unlocked in your library.',
        resource,
      });
    }

    // Check user points balance
    const userRes = await query('SELECT points FROM users WHERE id = $1', [userPayload.id]);
    const currentPoints = userRes.rows[0]?.points || 0;
    const unlockCost = resource.unlock_cost || 150;

    if (currentPoints < unlockCost) {
      return NextResponse.json(
        {
          error: `Insufficient points. You need ${unlockCost} points to unlock this resource, but you currently have ${currentPoints} points. Solve practice questions or complete courses to earn more!`,
          currentPoints,
          requiredPoints: unlockCost,
        },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Deduct 150 points atomically using the ledger
    const { newBalance } = await adjustPointsWithLedger(
      client,
      userPayload.id,
      -unlockCost,
      'LIBRARY_UNLOCK',
      'library',
      resource_id
    );

    // Record unlocked resource
    await client.query(
      `INSERT INTO user_unlocked_resources (user_id, resource_id, points_spent)
       VALUES ($1, $2, $3);`,
      [userPayload.id, resource_id, unlockCost]
    );

    // Notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Resource Unlocked!', $2, 'points');`,
      [
        userPayload.id,
        `You unlocked "${resource.title}". ${unlockCost} points were deducted from your balance. New balance: ${newBalance} points.`,
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: `Successfully unlocked "${resource.title}"! ${unlockCost} points deducted.`,
      newBalance,
      resource,
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Library unlock error:', err);
    return NextResponse.json({ error: 'Failed to unlock resource' }, { status: 500 });
  } finally {
    client.release();
  }
}
