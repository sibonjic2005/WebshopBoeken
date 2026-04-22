"use server";

import { query } from "./db";
import { PAGE_SIZE, type BookRow } from "./books-shared";

export async function loadBooks(offset: number): Promise<BookRow[]> {
  return query<BookRow>(
    `
    SELECT b.id, b.title, b.price_cents,
           STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
      FROM book b
      LEFT JOIN book_author ba ON ba.book_id = b.id
      LEFT JOIN author a ON a.id = ba.author_id
     GROUP BY b.id
     ORDER BY b.title, b.id
     LIMIT $1 OFFSET $2
  `,
    [PAGE_SIZE, offset],
  );
}
