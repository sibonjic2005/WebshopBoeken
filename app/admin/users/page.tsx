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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [users, countResult] = await Promise.all([
    query<User>(
      "SELECT id, email, first_name, last_name, role FROM customer ORDER BY last_name, first_name LIMIT $1 OFFSET $2",
      [PAGE_SIZE, offset],
    ),
    query<{ total: string }>("SELECT COUNT(*) AS total FROM customer"),
  ]);

  const totalPages = Math.ceil(parseInt(countResult[0].total, 10) / PAGE_SIZE);

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

      {users.length === 0 ? (
        <p className="text-zinc-500">No users yet.</p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-2">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2 capitalize">{user.role}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
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
          <Pagination page={page} totalPages={totalPages} basePath="/admin/users" />
        </>
      )}
    </>
  );
}
