import { Pool, type QueryResultRow } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://boekenhandel:boekenhandel@localhost:5434/boekenhandel",
});

export async function query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}
