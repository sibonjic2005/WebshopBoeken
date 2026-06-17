"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Check, LayoutGrid, ShoppingCart } from "lucide-react";
import { loadBooks } from "./books-actions";
import { addToCart } from "./cart/actions";
import { PAGE_SIZE, type BookRow, type CategoryRow } from "./books-shared";
import { CoverImage } from "./cover-image";

function AddToCartButton({ bookId, userId }: { bookId: number; userId: number | null }) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!userId) {
      window.location.href = "/user/login";
      return;
    }
    startTransition(async () => {
      await addToCart(userId, bookId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:text-zinc-900 disabled:opacity-50"
      aria-label="Toevoegen aan winkelwagen"
    >
      {added ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        <ShoppingCart size={14} strokeWidth={2.5} />
      )}
    </button>
  );
}

export function BooksList({
  initialBooks,
  categories,
  userId,
}: {
  initialBooks: BookRow[];
  categories: CategoryRow[];
  userId: number | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [books, setBooks] = useState<BookRow[]>(initialBooks);
  const [offset, setOffset] = useState(initialBooks.length);
  const [done, setDone] = useState(initialBooks.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const selectCategory = useCallback(async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    const result = await loadBooks(0, categoryId ?? undefined);
    setBooks(result);
    setOffset(result.length);
    setDone(result.length < PAGE_SIZE);
    setLoading(false);
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    const next = await loadBooks(offset, selectedCategory ?? undefined);
    setBooks((prev) => [...prev, ...next]);
    setOffset((prev) => prev + next.length);
    if (next.length < PAGE_SIZE) setDone(true);
    setLoading(false);
  }, [offset, loading, done, selectedCategory]);

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

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => selectCategory(null)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
          }`}
        >
          <LayoutGrid size={13} strokeWidth={2.5} />
          Alles
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => selectCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {books.length === 0 && !loading ? (
        <p className="py-12 text-center text-zinc-400">Geen boeken in deze categorie.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li key={book.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <Link
                href={`/books/${book.id}`}
                className="absolute inset-0 z-0"
                aria-label={book.title}
              />
              <div className="relative flex aspect-[4/5] items-center justify-center bg-zinc-50">
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                  Nieuw
                </span>
                <AddToCartButton bookId={book.id} userId={userId} />
                <div className="aspect-[2/3] max-h-64 overflow-hidden">
                  <CoverImage isbn={book.isbn} id={book.id} title={book.title} size="M" />
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="truncate text-sm font-semibold" title={book.title}>
                  {book.title}
                </span>
                <span className="ml-3 shrink-0 text-sm font-medium text-zinc-700">
                  &euro;{(book.price_cents / 100).toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <p className="mt-4 text-center text-sm text-zinc-400">Laden…</p>
      )}
    </>
  );
}
