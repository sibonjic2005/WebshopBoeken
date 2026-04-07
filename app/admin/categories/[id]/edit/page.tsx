import { notFound } from "next/navigation";
import { query } from "@/app/db";
import { updateCategory } from "../../actions";

type Category = { id: number; name: string; description: string | null };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await query<Category>(
    "SELECT id, name, description FROM category WHERE id = $1",
    [id]
  );
  if (rows.length === 0) notFound();
  const category = rows[0];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Edit category</h1>
      <form action={updateCategory} className="max-w-md space-y-4">
        <input type="hidden" name="id" value={category.id} />
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={category.name}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={category.description ?? ""}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
