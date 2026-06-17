import Link from "next/link";
import { query } from "@/app/db";
import { deleteCategory } from "./actions";
import { Pagination } from "../Pagination";
import { BackLink } from "@/app/BackLink";

const PAGE_SIZE = 20;

type Category = {
  id: number;
  name: string;
  description: string | null;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
  }>;
}) {
  const {
    page: pageParam,
    search,
    sort,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const searchQuery = search ? `%${search.toLowerCase()}%` : null;
  const sortBy = sort || "name";

  let whereClause = "";
  const queryParams: any[] = [];

  if (searchQuery) {
    whereClause = `
      WHERE (
        LOWER(name) LIKE $1
        OR LOWER(COALESCE(description, '')) LIKE $1
      )
    `;
    queryParams.push(searchQuery);
  }

  const orderClause =
    sortBy === "newest"
      ? "id DESC"
      : "name ASC";

  const [categories, countResult] = await Promise.all([
    query<Category>(
      `
      SELECT id, name, description
      FROM category
      ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
      `,
      [...queryParams, PAGE_SIZE, offset],
    ),

    query<{ total: string }>(
      `
      SELECT COUNT(*) AS total
      FROM category
      ${whereClause}
      `,
      queryParams,
    ),
  ]);

  const totalPages = Math.ceil(
    parseInt(countResult[0].total, 10) / PAGE_SIZE,
  );

  return (
    <>
      <BackLink href="/admin" label="Admin" />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>

        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          New category
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6 flex gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search category..."
          defaultValue={search || ""}
          className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700"
        >
          Search
        </button>

        {search && (
          <Link
            href="/admin/categories"
            className="rounded-lg border px-6 py-2 hover:bg-zinc-100"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Sort Filters */}
      <div className="mb-6 flex gap-2">
        <span className="flex items-center text-sm font-medium text-zinc-600">
          Sort by:
        </span>

        <Link
          href={`/admin/categories?${new URLSearchParams({
            ...(search ? { search } : {}),
            sort: "name",
          }).toString()}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            !sort || sort === "name"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Name
        </Link>

        <Link
          href={`/admin/categories?${new URLSearchParams({
            ...(search ? { search } : {}),
            sort: "newest",
          }).toString()}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "newest"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Newest
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-zinc-500">No categories found.</p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b">
                  <td className="py-2">{cat.name}</td>

                  <td className="py-2 text-zinc-500">
                    {cat.description}
                  </td>

                  <td className="py-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <form action={deleteCategory}>
                        <input
                          type="hidden"
                          name="id"
                          value={cat.id}
                        />

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

          <div className="mt-8">
            <Pagination
              page={page}
              totalPages={totalPages}
              basePath={`/admin/categories?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(sort ? { sort } : {}),
              }).toString()}`}
            />
          </div>
        </>
      )}
    </>
  );
}