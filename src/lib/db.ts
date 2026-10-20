import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { isPlaceholderValue, isProduction } from './env';

function getConnectionString(): string {
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl || isPlaceholderValue(dbUrl)) {
    throw new Error(
      'DATABASE_URL must be configured with a real PostgreSQL connection string. See .env.example; no credential fallback is provided.'
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// scheme.');
  }

  return dbUrl;
}

function getSslConfig(connectionString: string) {
  const sslMode = new URL(connectionString).searchParams.get('sslmode')?.toLowerCase();
  if (!sslMode || sslMode === 'disable') return false;
  if (sslMode === 'no-verify') {
    if (isProduction()) {
      throw new Error('DATABASE_URL sslmode=no-verify is not allowed in production.');
    }
    return { rejectUnauthorized: false };
  }
  // require/prefer/verify-ca/verify-full all keep certificate verification on.
  return { rejectUnauthorized: true };
}

const connectionString = getConnectionString();

const pool = new Pool({
  connectionString,
  ssl: getSslConfig(connectionString),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Atomic transaction to award or deduct points, recording in the immutable point ledger
 */
export async function adjustPointsWithLedger(
  client: PoolClient,
  userId: number,
  amount: number,
  reason: string,
  referenceType: string = '',
  referenceId: string = ''
): Promise<{ newBalance: number }> {
  // 1. Lock user row for update
  const userRes = await client.query(
    'SELECT points FROM users WHERE id = $1 FOR UPDATE;',
    [userId]
  );
  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const currentPoints = userRes.rows[0].points;
  const newBalance = currentPoints + amount;

  if (newBalance < 0 && amount < 0) {
    throw new Error('Insufficient points balance.');
  }

  // 2. Update user's points
  await client.query('UPDATE users SET points = $1, updated_at = NOW() WHERE id = $2;', [
    newBalance,
    userId,
  ]);

  // 3. Insert into point_ledger
  await client.query(
    `INSERT INTO point_ledger (user_id, amount, reason, reference_type, reference_id, balance_after)
     VALUES ($1, $2, $3, $4, $5, $6);`,
    [userId, amount, reason, referenceType, referenceId, newBalance]
  );

  return { newBalance };
}

export default pool;
