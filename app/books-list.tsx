"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadBooks } from "./books-actions";
import { PAGE_SIZE, type BookRow } from "./books-shared";

export function BooksList({ initialBooks }: { initialBooks: BookRow[] }) {
  const [books, setBooks] = useState<BookRow[]>(initialBooks);
  const [done, setDone] = useState(initialBooks.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    const next = await loadBooks(books.length);
    setBooks((prev) => [...prev, ...next]);
    if (next.length < PAGE_SIZE) setDone(true);
    setLoading(false);
  }, [books.length, loading, done]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || done) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, done]);

  if (books.length === 0) {
    return <p className="text-zinc-500">No books yet.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <li
            key={book.id}
            className="rounded-lg border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="truncate font-semibold" title={book.title}>
              {book.title}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{book.authors}</p>
            <p className="mt-2 font-mono text-sm">
              &euro;{(book.price_cents / 100).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <p className="mt-4 text-center text-sm text-zinc-500">Loading…</p>
      )}
    </>
  );
}
