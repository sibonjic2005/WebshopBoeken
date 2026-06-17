import Link from "next/link";
import { query } from "@/app/db";
import { deleteUser } from "./actions";
import { Pagination } from "../Pagination";
import { BackLink } from "@/app/BackLink";

const PAGE_SIZE = 20;

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    sort?: string;
  }>;
}) {
  const {
    page: pageParam,
    search,
    role,
    sort,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const searchQuery = search ? `%${search.toLowerCase()}%` : null;

  let whereClause = "";
  const queryParams: any[] = [];
  const conditions: string[] = [];

  if (searchQuery) {
    conditions.push(`
      (
        LOWER(first_name || ' ' || last_name) LIKE $1
        OR LOWER(email) LIKE $1
      )
    `);
    queryParams.push(searchQuery);
  }

  if (role) {
    conditions.push(`role = $${queryParams.length + 1}`);
    queryParams.push(role);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  let orderClause = "last_name ASC";

  if (sort === "email") {
    orderClause = "email ASC";
  } else if (sort === "role") {
    orderClause = "role ASC";
  } else if (sort === "newest") {
    orderClause = "id DESC";
  }

  const buildUrl = (params: Record<string, string | undefined>) =>
    `/admin/users?${new URLSearchParams({
      ...(search ? { search } : {}),
      ...(role ? { role } : {}),
      ...(sort ? { sort } : {}),
      ...params,
    }).toString()}`;

  const [users, countResult] = await Promise.all([
    query<User>(
      `
      SELECT id, email, first_name, last_name, role
      FROM customer
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
      FROM customer
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
        <h1 className="text-2xl font-bold">Users</h1>

        <Link
          href="/admin/users/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          New user
        </Link>
      </div>

      {/* SEARCH + FILTERS */}
      <form method="GET" className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search name or email..."
          defaultValue={search || ""}
          className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <select
          name="role"
          defaultValue={role || ""}
          className="rounded-lg border px-4 py-2"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700"
        >
          Filter
        </button>

        {(search || role) && (
          <Link
            href="/admin/users"
            className="rounded-lg border px-6 py-2 hover:bg-zinc-100"
          >
            Clear
          </Link>
        )}
      </form>

      {/* SORT */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="flex items-center text-sm font-medium text-zinc-600">
          Sort by:
        </span>

        <Link
          href={buildUrl({ sort: "name" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            !sort || sort === "name"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Name
        </Link>

        <Link
          href={buildUrl({ sort: "email" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "email"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Email
        </Link>

        <Link
          href={buildUrl({ sort: "role" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "role"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Role
        </Link>

        <Link
          href={buildUrl({ sort: "newest" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "newest"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Newest
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-zinc-500">No users found.</p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  <td className="capitalize">{user.role}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <button className="text-red-600 hover:underline">
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
              basePath={`/admin/users?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(role ? { role } : {}),
                ...(sort ? { sort } : {}),
              }).toString()}`}
            />
          </div>
        </>
      )}
    </>
  );
}