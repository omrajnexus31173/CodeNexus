'use strict';

const PLACEHOLDER_PATTERNS = [
  /replace_with/i,
  /your_/i,
  /example/i,
  /change[_-]?me/i,
  /username:password/i,
];

function isPlaceholderValue(value) {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function requireDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value || isPlaceholderValue(value)) {
    throw new Error(
      'DATABASE_URL must be configured with a real PostgreSQL connection string. See .env.example; no credential fallback is provided.'
    );
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// scheme.');
  }
  return value;
}

function databaseSslConfig(connectionString = requireDatabaseUrl()) {
  const sslMode = new URL(connectionString).searchParams.get('sslmode')?.toLowerCase();
  if (!sslMode || sslMode === 'disable') return false;
  if (sslMode === 'no-verify') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL sslmode=no-verify is not allowed in production.');
    }
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: true };
}

module.exports = { requireDatabaseUrl, databaseSslConfig, isPlaceholderValue };
