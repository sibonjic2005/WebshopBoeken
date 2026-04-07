import { Pool } from "pg";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

export async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = await pool.query<{ name: string }>(
      "SELECT name FROM _migrations ORDER BY name"
    );
    const appliedSet = new Set(applied.rows.map((r) => r.name));

    const dir = join(process.cwd(), "migrations");
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

    for (const file of files) {
      if (appliedSet.has(file)) continue;

      const sql = await readFile(join(dir, file), "utf-8");
      await pool.query("BEGIN");
      try {
        await pool.query(sql);
        await pool.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
        await pool.query("COMMIT");
        console.log(`migration applied: ${file}`);
      } catch (err) {
        await pool.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await pool.end();
  }
}
