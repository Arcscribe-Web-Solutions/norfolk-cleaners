/**
 * PostgreSQL Database Client
 * --------------------------
 * Optional — disabled by default. Set ENABLE_DATABASE=true to activate.
 *
 * Uses the `pg` library with a singleton pool pattern to avoid
 * opening too many connections during development hot-reloads.
 */

import { Pool, type PoolConfig } from "pg";
import { requireFeature } from "./features";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

function createPool(): Pool {
  requireFeature("database");

  const config: PoolConfig = {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? "clientdb",
    user: process.env.DATABASE_USER ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "",
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  };

  return new Pool(config);
}

/**
 * Returns a singleton Pool instance.
 * In development, the pool is cached on `globalThis` to survive HMR.
 */
export function getPool(): Pool {
  if (!globalForPg.__pgPool) {
    globalForPg.__pgPool = createPool();
  }
  return globalForPg.__pgPool;
}

/**
 * Convenience helper — runs a parameterised query and returns rows.
 *
 * @example
 * ```ts
 * const users = await query<User>("SELECT * FROM users WHERE active = $1", [true]);
 * ```
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

/**
 * Test the database connection. Returns true if the connection is healthy.
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
