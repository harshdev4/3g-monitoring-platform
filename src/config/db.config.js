import pg from "pg";

const { Pool } = pg;

const globalForPg = globalThis;

const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export default pool;