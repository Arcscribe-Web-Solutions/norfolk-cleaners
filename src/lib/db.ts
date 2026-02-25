/**
 * PostgreSQL Database Client - Supabase (Coolify-hosted)
 * --------------------------------------------------------
 * Optional - disabled by default. Set ENABLE_DATABASE=true to activate.
 *
 * Connects to a Coolify-hosted Supabase PostgreSQL instance using a
 * DATABASE_URL connection string (the direct Postgres connection, NOT
 * the Supabase REST/PostgREST URL).
 *
 * Connection string format (from Coolify Supabase service):
 *   postgresql://postgres:<password>@<host>:5432/postgres
 *
 * Uses the `pg` library with a singleton pool pattern to avoid opening
 * too many connections during Next.js development hot-reloads.
 */

import { Pool, type PoolConfig } from "pg";
import { requireFeature } from "./features";

const globalForPg = globalThis as unknown as { __pgPool?: Pool };

function createPool(): Pool {
  requireFeature("database");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Coolify Supabase PostgreSQL connection string to .env.local.\n" +
      "Format: postgresql://postgres:<password>@<host>:5432/postgres"
    );
  }

  console.log("Creating database pool with connection string:", connectionString.replace(/:[^:@]+@/, ':****@'));

  const config: PoolConfig = {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: false, // Disable SSL for Coolify private network
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
 * Convenience helper - runs a parameterised query and returns rows.
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
    console.log("Testing database connection...");
    const pool = getPool();
    await pool.query("SELECT 1");
    console.log("Database connection test successful");
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}
