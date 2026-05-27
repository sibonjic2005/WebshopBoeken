import { readFile } from "fs/promises";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  const sql = await readFile("migrations/002_customer_role.sql", "utf-8");
  await pool.query(sql);
  console.log("Applied migrations/002_customer_role.sql");
} finally {
  await pool.end();
}
