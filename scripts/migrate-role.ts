import { readFile } from "fs/promises";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  // Apply all schema migrations in order
  for (const file of [
    "migrations/001_schema.sql",
    "migrations/002_review.sql",
    "migrations/002_customer_role.sql",
  ]) {
    const sql = await readFile(file, "utf-8");
    await pool.query(sql);
    console.log(`Applied ${file}`);
  }

  // Upsert seed accounts (admin + service).
  // ON CONFLICT keeps real customer data untouched while ensuring
  // these two accounts always exist with the correct password and role.
  // admin@example.com  / password123
  // service@example.com / password123
  await pool.query(`
    INSERT INTO customer (email, password_hash, first_name, last_name, role) VALUES
      ('admin@example.com',   '$2b$10$5HuP/mXJhJoTWU9y33BgZeTPDkU9Cd.8dhdrkAZRmfdYxx/KAtys.', 'Alice', 'Jansen',  'admin'),
      ('service@example.com', '$2b$10$5HuP/mXJhJoTWU9y33BgZeTPDkU9Cd.8dhdrkAZRmfdYxx/KAtys.', 'Sam',   'Service', 'service')
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role          = EXCLUDED.role
  `);
  console.log("Seeded admin@example.com and service@example.com (password123)");
} finally {
  await pool.end();
}
