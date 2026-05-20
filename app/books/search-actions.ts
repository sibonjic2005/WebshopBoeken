"use server";

import { query } from "@/app/db";
import type { BookRow } from "@/app/books-shared";

export async function searchBooks(searchQuery: string): Promise<BookRow[]> {
  const searchTerm = `%${searchQuery}%`;
  return query<BookRow>(
    `SELECT b.id, b.title, b.isbn, b.price_cents,
            STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
       FROM book b
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
      WHERE b.title ILIKE $1 OR a.first_name ILIKE $1 OR a.last_name ILIKE $1
      GROUP BY b.id
      ORDER BY b.title`,
    [searchTerm],
  );
}
