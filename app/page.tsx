import Link from "next/link";
import { loadBooks, loadCategories, loadFeaturedBooks } from "./books-actions";
import { BooksList } from "./books-list";
import { CoverImage } from "./cover-image";

export default async function Home() {
  const [initialBooks, categories, featuredBooks] = await Promise.all([
    loadBooks(0),
    loadCategories(),
    loadFeaturedBooks(),
  ]);

  return (
    <>
      <section className="py-16 text-center">
        <h1 className="mx-auto max-w-md text-4xl font-bold leading-tight tracking-tight">
          Boeken voor elke lezer.
        </h1>
      </section>

      {featuredBooks.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold tracking-tight">Populaire titels</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {featuredBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="group flex flex-col gap-2">
                <div className="aspect-[2/3] overflow-hidden rounded">
                  <CoverImage isbn={book.isbn} id={book.id} title={book.title} size="M" />
                </div>
                <div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:underline">
                    {book.title}
                  </p>
                  {book.authors && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{book.authors}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <BooksList initialBooks={initialBooks} categories={categories} />
    </>
  );
}
