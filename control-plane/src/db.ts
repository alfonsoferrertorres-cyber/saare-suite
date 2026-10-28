import { Kysely, PostgresDialect, SqliteDialect } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { Pool } from 'pg';
import Database from 'better-sqlite3';

export interface DatabaseSchema {
  evidences: {
    id: string;
    verdict_id: string;
    evidence_id: string;
    tenant_id: string;
    decision: string;
    payload_hash: string;
    ed25519_signature: string;
    created_at: string;
  };
}

export function createAgnosticDb(env: any): Kysely<DatabaseSchema> {
  if (env && env.DB) {
    return new Kysely<DatabaseSchema>({ dialect: new D1Dialect({ database: env.DB }) });
  }
  if (process.env.DATABASE_URL?.startsWith('postgres')) {
    return new Kysely<DatabaseSchema>({
      dialect: new PostgresDialect({ pool: new Pool({ connectionString: process.env.DATABASE_URL }) }),
    });
  }
  const sqliteDb = new Database(process.env.SQLITE_PATH || './saare_vault.db');
  return new Kysely<DatabaseSchema>({ dialect: new SqliteDialect({ database: sqliteDb }) });
}
