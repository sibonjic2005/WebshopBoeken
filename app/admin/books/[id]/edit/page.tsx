import { notFound } from "next/navigation";
import { query } from "@/app/db";
import { updateBook } from "../../actions";
import ComboboxInput from "../../ComboboxInput";

type Book = {
  id: number;
  title: string;
  isbn: string;
  price_cents: number;
  stock: number;
  publisher_id: number;
};
type Publisher = { id: number; name: string };
type Author = { id: number; first_name: string; last_name: string };
type Category = { id: number; name: string };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bookRows, publishers, authors, categories, bookAuthors, bookCategories] =
    await Promise.all([
      query<Book>(
        "SELECT id, title, isbn, price_cents, stock, publisher_id FROM book WHERE id = $1",
        [id]
      ),
      query<Publisher>("SELECT id, name FROM publisher ORDER BY name"),
      query<Author>(
        "SELECT id, first_name, last_name FROM author ORDER BY last_name, first_name"
      ),
      query<Category>("SELECT id, name FROM category ORDER BY name"),
      query<{ author_id: number }>(
        "SELECT author_id FROM book_author WHERE book_id = $1",
        [id]
      ),
      query<{ category_id: number }>(
        "SELECT category_id FROM book_category WHERE book_id = $1",
        [id]
      ),
    ]);

  if (bookRows.length === 0) notFound();
  const book = bookRows[0];
  const selectedAuthorIds = new Set(bookAuthors.map((r) => r.author_id));
  const selectedCategoryIds = new Set(bookCategories.map((r) => r.category_id));

  const currentPublisher = publishers.find((p) => p.id === book.publisher_id);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Edit book</h1>
      <form action={updateBook} className="max-w-md space-y-4">
        <input type="hidden" name="id" value={book.id} />
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={book.title}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="isbn" className="mb-1 block text-sm font-medium">
            ISBN
          </label>
          <input
            id="isbn"
            name="isbn"
            required
            defaultValue={book.isbn}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label
            htmlFor="price_cents"
            className="mb-1 block text-sm font-medium"
          >
            Price (cents)
          </label>
          <input
            id="price_cents"
            name="price_cents"
            type="number"
            required
            min={0}
            defaultValue={book.price_cents}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            required
            min={0}
            defaultValue={book.stock}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Publisher</label>
          <ComboboxInput
            name="publisher"
            options={publishers.map((p) => ({
              value: String(p.id),
              label: p.name,
            }))}
            placeholder="Type to search or add publisher..."
            defaultValue={
              currentPublisher
                ? [{ value: String(currentPublisher.id), label: currentPublisher.name }]
                : []
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Authors</label>
          <ComboboxInput
            name="authors"
            multiple
            options={authors.map((a) => ({
              value: String(a.id),
              label: `${a.first_name} ${a.last_name}`,
            }))}
            placeholder="Type to search or add author..."
            defaultValue={authors
              .filter((a) => selectedAuthorIds.has(a.id))
              .map((a) => ({
                value: String(a.id),
                label: `${a.first_name} ${a.last_name}`,
              }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categories</label>
          <ComboboxInput
            name="categories"
            multiple
            options={categories.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
            placeholder="Type to search or add category..."
            defaultValue={categories
              .filter((c) => selectedCategoryIds.has(c.id))
              .map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Save
        </button>
      </form>
    </>
  );
}
