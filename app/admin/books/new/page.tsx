import { query } from "@/app/db";
import { createBook } from "../actions";
import ComboboxInput from "../ComboboxInput";

type Publisher = { id: number; name: string };
type Author = { id: number; first_name: string; last_name: string };
type Category = { id: number; name: string };

export default async function NewBookPage() {
  const [publishers, authors, categories] = await Promise.all([
    query<Publisher>("SELECT id, name FROM publisher ORDER BY name"),
    query<Author>(
      "SELECT id, first_name, last_name FROM author ORDER BY last_name, first_name"
    ),
    query<Category>("SELECT id, name FROM category ORDER BY name"),
  ]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">New book</h1>
      <form action={createBook} className="max-w-md space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
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
            defaultValue={0}
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
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Create
        </button>
      </form>
    </>
  );
}
