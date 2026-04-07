import { query } from "./db";
import { formatCurrency } from "./format-currency";

type BookRow = {
  id: number;
  title: string;
  price_cents: number;
  authors: string;
};

export default async function Home() {
  const books = await query<BookRow>(`
    SELECT b.id, b.title, b.price_cents,
           STRING_AGG(a.first_name || ' ' || a.last_name, ', ') AS authors
      FROM book b
      LEFT JOIN book_author ba ON ba.book_id = b.id
      LEFT JOIN author a ON a.id = ba.author_id
     GROUP BY b.id
     ORDER BY b.title
  `);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Books</h1>

      {books.length === 0 ? (
        <p className="text-zinc-500">No books yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="rounded-lg border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="font-semibold">{book.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{book.authors}</p>
              <p className="mt-2 font-mono text-sm">
                {formatCurrency(book.price_cents)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
