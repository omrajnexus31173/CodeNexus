const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { requireDatabaseUrl, databaseSslConfig } = require('./lib/database-url');

const connectionString = requireDatabaseUrl();

const pool = new Pool({
  connectionString,
  ssl: databaseSslConfig(connectionString)
});

async function migrateAuthSecurity() {
  const client = await pool.connect();
  try {
    console.log('--- Applying Code Nexus Auth & Security Schema Migration ---');
    await client.query('BEGIN');

    // 1. Update users table: alter default is_verified to FALSE
    await client.query(`
      ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT FALSE;
    `);

    // 2. Verification Tokens table (stores SHA-256 hash of token, never plain text)
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_hash ON verification_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_expires ON verification_tokens(user_id, expires_at);
    `);

    // 3. Password Reset Tokens table (stores SHA-256 hash of token)
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_expires ON password_reset_tokens(user_id, expires_at);
    `);

    // 4. Rate Limits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        identifier VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rate_limits_action_ident_time ON rate_limits(action, identifier, created_at);
    `);

    await client.query('COMMIT');
    console.log('✅ Auth & Security Migration applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAuthSecurity();
