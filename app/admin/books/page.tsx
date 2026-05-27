import Link from "next/link";
import { query } from "@/app/db";
import { formatCurrency } from "@/app/format-currency";
import { deleteBook } from "./actions";
import { Pagination } from "../Pagination";
import { BackLink } from "@/app/BackLink";

const PAGE_SIZE = 20;

type BookRow = {
  id: number;
  title: string;
  isbn: string;
  price_cents: number;
  stock: number;
  publisher: string;
  authors: string | null;
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [books, countResult] = await Promise.all([
    query<BookRow>(
      `SELECT b.id, b.title, b.isbn, b.price_cents, b.stock, p.name AS publisher,
              STRING_AGG(DISTINCT a.first_name || ' ' || a.last_name, ', ') AS authors
         FROM book b
         JOIN publisher p ON p.id = b.publisher_id
         LEFT JOIN book_author ba ON ba.book_id = b.id
         LEFT JOIN author a ON a.id = ba.author_id
        GROUP BY b.id, p.name
        ORDER BY b.title
        LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset],
    ),
    query<{ total: string }>("SELECT COUNT(*) AS total FROM book"),
  ]);

  const totalPages = Math.ceil(parseInt(countResult[0].total, 10) / PAGE_SIZE);

  return (
    <>
      <BackLink href="/admin" label="Admin" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Books</h1>
        <Link
          href="/admin/books/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          New book
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-zinc-500">No books yet.</p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium">ISBN</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Stock</th>
                <th className="pb-2 font-medium">Publisher</th>
                <th className="pb-2 font-medium">Authors</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b">
                  <td className="py-2">{book.title}</td>
                  <td className="py-2 font-mono text-xs">{book.isbn}</td>
                  <td className="py-2">{formatCurrency(book.price_cents)}</td>
                  <td className="py-2">{book.stock}</td>
                  <td className="py-2">{book.publisher}</td>
                  <td className="py-2 text-zinc-500">{book.authors}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteBook}>
                        <input type="hidden" name="id" value={book.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} basePath="/admin/books" />
        </>
      )}
    </>
  );
}
