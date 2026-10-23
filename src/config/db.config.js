import pg from "pg";

const { Pool } = pg;

const globalForPg = globalThis;

const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Allow hosted databases time to wake from an idle/cold state.
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS) || 30000,
  idleTimeoutMillis: 30000,
  max: 5,
  keepAlive: true,
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export default pool;
