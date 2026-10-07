import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(
  __dirname,
  "../database/schema.sql"
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("");
    console.log("========================================");
    console.log("3Gs Project - Database Setup");
    console.log("========================================");
    console.log("");

    console.log(`Schema file: ${schemaPath}`);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(
        `schema.sql not found at: ${schemaPath}`
      );
    }

    const schema = fs.readFileSync(
      schemaPath,
      "utf8"
    );

    if (!schema.trim()) {
      throw new Error(
        "schema.sql is empty."
      );
    }

    console.log("");
    console.log("Connecting to PostgreSQL...");

    await client.query("BEGIN");

    console.log("Executing schema...");

    await client.query(schema);

    await client.query("COMMIT");

    console.log("");
    console.log("========================================");
    console.log("DATABASE SETUP COMPLETED");
    console.log("========================================");
    console.log("");
    console.log("Tables are ready.");
    console.log("");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("");
    console.error("========================================");
    console.error("DATABASE SETUP FAILED");
    console.error("========================================");
    console.error("");

    console.error(error);

    console.error("");
    console.error(
      "All schema changes have been rolled back."
    );
    console.error("");
    
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();