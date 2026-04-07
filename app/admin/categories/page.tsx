import Link from "next/link";
import { query } from "@/app/db";
import { deleteCategory } from "./actions";

type Category = { id: number; name: string; description: string | null };

export default async function CategoriesPage() {
  const categories = await query<Category>(
    "SELECT id, name, description FROM category ORDER BY name"
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-zinc-500">No categories yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-zinc-800">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b dark:border-zinc-800">
                <td className="py-2">{cat.name}</td>
                <td className="py-2 text-zinc-500">{cat.description}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/categories/${cat.id}/edit`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline dark:text-red-400"
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
      )}
    </>
  );
}
