import Link from "next/link";
import { query } from "@/app/db";
import { deleteUser } from "./actions";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

export default async function UsersPage() {
  const users = await query<User>(
    "SELECT id, email, first_name, last_name FROM customer ORDER BY last_name, first_name"
  );

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New user
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-zinc-500">No users yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-zinc-800">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b dark:border-zinc-800">
                <td className="py-2">
                  {user.first_name} {user.last_name}
                </td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={user.id} />
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
