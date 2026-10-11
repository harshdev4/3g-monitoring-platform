import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

async function createTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from your .env file.");
  }

  const schemaPath = path.resolve("src", "database", "schema.sql");
  const schemaSQL = await readFile(schemaPath, "utf8");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("Connected to Aiven PostgreSQL.");

    await client.query("BEGIN");

    await client.query(schemaSQL);

    await client.query("COMMIT");

    console.log("All tables created successfully.");

    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log("\nTables in public schema:");
    console.table(result.rows);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    console.error("Failed to create tables:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

createTables().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});