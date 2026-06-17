import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight, Heart } from "lucide-react";
import { addToCart } from "@/app/cart/actions";
import { loadBook, loadRecommended } from "@/app/books-actions";
import type { BookRow } from "@/app/books-shared";
import { CoverImage } from "@/app/cover-image";
import { getUserSession } from "@/app/lib/session";
import { incrementBookView, getBookViews } from "@/app/lib/views";

function SmallBookCard({ book }: { book: BookRow }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="relative flex aspect-[4/5] items-center justify-center bg-zinc-50 p-6">
        <Link
          href={`/books/${book.id}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-zinc-900"
          aria-label={`View ${book.title}`}
        >
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
        <CoverImage isbn={book.isbn} id={book.id} title={book.title} size="M" />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/books/${book.id}`} className="truncate text-sm font-semibold hover:underline" title={book.title}>
          {book.title}
        </Link>
        <span className="ml-3 shrink-0 text-sm font-medium text-zinc-700">
          &euro;{(book.price_cents / 100).toFixed(2)}
        </span>
      </div>
    </li>
  );
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) notFound();

  const [book, recommended, userId, views] = await Promise.all([
    loadBook(bookId),
    loadRecommended(bookId),
    getUserSession(),
    incrementBookView(bookId).then(() => getBookViews(bookId)),
  ]);

  if (!book) notFound();

  async function handleAddToCart() {
    "use server";
    if (userId) {
      await addToCart(userId, bookId, 1);
    }
  }

  return (
    <>
      <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-zinc-700">Ontdekken</Link>
        <ChevronRight size={12} strokeWidth={2} />
        <span className="text-zinc-700">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-10">
          <div className="w-[280px] h-[373px] shrink-0">
            <CoverImage isbn={book.isbn} id={book.id} title={book.title} size="L" />
          </div>
          <div className="mt-6 flex gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-900" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="h-2 w-2 rounded-full bg-zinc-300" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold leading-snug">{book.title}</h1>
            <button className="ml-4 mt-1 shrink-0 text-zinc-300 hover:text-red-400 transition-colors">
              <Heart size={22} strokeWidth={2} />
            </button>
          </div>

          <p className="mt-2 text-xl font-medium text-zinc-700">
            &euro;{(book.price_cents / 100).toFixed(2)}
          </p>

          {book.authors && (
            <p className="mt-3 text-sm text-zinc-500">
              van {book.authors}
            </p>
          )}

          <div className="mt-8">
            <h2 className="text-sm font-semibold">Details</h2>
            <dl className="mt-3 space-y-2 text-sm text-zinc-600">
              {book.publisher && (
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-zinc-400">Uitgever</dt>
                  <dd>{book.publisher}</dd>
                </div>
              )}
              {book.categories && (
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-zinc-400">Categorieën</dt>
                  <dd>{book.categories}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-zinc-400">ISBN</dt>
                <dd className="font-mono">{book.isbn}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-zinc-400">Voorraad</dt>
                <dd>{book.stock > 0 ? `${book.stock} beschikbaar` : "Niet op voorraad"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-zinc-400">Bekeken</dt>
                <dd>{views} {views === 1 ? "keer" : "keer"}</dd>
              </div>
            </dl>
          </div>

          <form action={handleAddToCart} className="mt-10">
            {!userId ? (
              <Link
                href="/user/login"
                className="block w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 text-center"
              >
                Login om toe te voegen
              </Link>
            ) : (
              <button
                type="submit"
                disabled={book.stock === 0}
                className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                In winkelwagen
              </button>
            )}
          </form>
        </div>
      </div>

      {recommended.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Aanbevolen</h2>
            <Link href="/" className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-colors">
              Meer bekijken
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((rec) => (
              <SmallBookCard key={rec.id} book={rec} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
