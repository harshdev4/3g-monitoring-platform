import pg from "pg";

const { Pool } = pg;

const globalForPg = globalThis;

const pool = globalForPg.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export default pool;