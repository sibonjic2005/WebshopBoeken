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
  sales_count: number;
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>;
}) {
  const { page: pageParam, search, sort } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  
  const searchQuery = search ? `%${search.toLowerCase()}%` : null;
  const sortBy = sort || "title";

  // Build the order clause based on sort parameter
  let orderClause = "b.title";
  if (sortBy === "popularity") {
    orderClause = "COALESCE(COUNT(ol.id), 0) DESC, b.title";
  } else if (sortBy === "stock") {
    orderClause = "b.stock DESC, b.title";
  }

  // Build the where clause for search
  let whereClause = "";
  const queryParams: any[] = [];
  if (searchQuery) {
    whereClause = `WHERE (LOWER(b.title) LIKE $1 OR LOWER(b.isbn) LIKE $1 OR LOWER(a.first_name || ' ' || a.last_name) LIKE $1)`;
    queryParams.push(searchQuery);
  }

  const [books, countResult] = await Promise.all([
    query<BookRow>(
      `SELECT b.id, b.title, b.isbn, b.price_cents, b.stock, p.name AS publisher,
              STRING_AGG(DISTINCT a.first_name || ' ' || a.last_name, ', ') AS authors,
              COALESCE(COUNT(ol.id), 0)::int AS sales_count
         FROM book b
         JOIN publisher p ON p.id = b.publisher_id
         LEFT JOIN book_author ba ON ba.book_id = b.id
         LEFT JOIN author a ON a.id = ba.author_id
         LEFT JOIN order_line ol ON ol.book_id = b.id
        ${whereClause}
        GROUP BY b.id, p.name
        ORDER BY ${orderClause}
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, PAGE_SIZE, offset],
    ),
    query<{ total: string }>(
      `SELECT COUNT(DISTINCT b.id) AS total FROM book b
       LEFT JOIN book_author ba ON ba.book_id = b.id
       LEFT JOIN author a ON a.id = ba.author_id
       ${whereClause}`,
      queryParams,
    ),
  ]);

  const totalPages = Math.ceil(parseInt(countResult[0].total, 10) / PAGE_SIZE);

  return (
    <>
      <BackLink href="/admin" label="Admin" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Boeken</h1>
        <Link
          href="/admin/books/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Nieuw boek
        </Link>
      </div>

      {/* Search Bar */}
      <form method="GET" className="mb-6 flex gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search title, author or ISBN..."
          defaultValue={search || ""}
          className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700"
        >
          Zoeken
        </button>
        {search && (
          <Link
            href="/admin/books"
            className="rounded-lg border px-6 py-2 text-zinc-900 hover:bg-zinc-100"
          >
            Wissen
          </Link>
        )}
      </form>

      {/* Sort Filters */}
    <div className="mb-6 flex flex-wrap gap-2">
      <span className="flex items-center text-sm font-medium text-zinc-600">
        Sorteer op:
      </span>

      <Link
        href={`/admin/books?${new URLSearchParams({
          ...(search ? { search } : {}),
          sort: "title",
        }).toString()}`}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          sort === "title" || !sort
            ? "bg-zinc-900 text-white"
            : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
        }`}
      >
        Title
      </Link>

      <Link
        href={`/admin/books?${new URLSearchParams({
          ...(search ? { search } : {}),
          sort: "popularity",
        }).toString()}`}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          sort === "popularity"
            ? "bg-zinc-900 text-white"
            : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
        }`}
      >
        Popularity
      </Link>

  <Link
    href={`/admin/books?${new URLSearchParams({
      ...(search ? { search } : {}),
      sort: "stock",
    }).toString()}`}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
      sort === "stock"
        ? "bg-zinc-900 text-white"
        : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
    }`}
  >
    Stock
  </Link>
</div>

      {books.length === 0 ? (
        <p className="text-zinc-500">Geen boeken gevonden.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Header */}
                <div className="mb-3">
                  <h3 className="line-clamp-2 text-lg font-semibold text-zinc-900">
                    {book.title}
                  </h3>
                  <p className="text-sm text-zinc-600">{book.authors}</p>
                </div>

                {/* Details Grid */}
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  {/* Prijs */}
                  <div>
                    <p className="text-zinc-500">Prijs</p>
                    <p className="font-semibold text-zinc-900">
                      {formatCurrency(book.price_cents)}
                    </p>
                  </div>

                  {/* Voorraad */}
                  <div>
                    <p className="text-zinc-500">Voorraad</p>
                    <p className="font-semibold text-zinc-900">
                      {book.stock} stuks
                    </p>
                  </div>

                  {/* Verkopen */}
                  <div>
                    <p className="text-zinc-500">Verkopen</p>
                    <p className="font-semibold text-zinc-900">{book.sales_count}</p>
                  </div>

                  {/* Uitgever */}
                  <div>
                    <p className="text-zinc-500">Uitgever</p>
                    <p className="font-semibold text-zinc-900">{book.publisher}</p>
                  </div>
                </div>

                {/* ISBN */}
                <div className="mb-4 border-t pt-3">
                  <p className="text-xs text-zinc-500">ISBN</p>
                  <p className="font-mono text-sm text-zinc-600">{book.isbn}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/books/${book.id}/edit`}
                    className="flex-1 rounded-lg bg-zinc-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-zinc-800"
                  >
                    Bewerk
                  </Link>
                  <form action={deleteBook} className="flex-1">
                    <input type="hidden" name="id" value={book.id} />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                      Verwijder
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              basePath={`/admin/books?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(sort && sort !== "title" ? { sort } : {}),
              }).toString()}`}
            />
          </div>
        </>
      )}
    </>
  );
}
