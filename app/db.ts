import { Pool, type QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export async function query<T extends QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {

  const result = await pool.query<T>(sql, params);

  return result.rows;
}


// Voor transacties waarbij meerdere queries als één geheel moeten werken
export async function transaction(
  callback: (client: any) => Promise<void>
) {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    await callback(client);

    await client.query("COMMIT");


  } catch (error) {

    await client.query("ROLLBACK");

    throw error;


  } finally {

    client.release();

  }
}