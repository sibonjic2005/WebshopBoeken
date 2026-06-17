import Link from "next/link";
import { query } from "@/app/db";
import { BackLink } from "@/app/BackLink";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

export default async function ServiceUsersPage() {
  const users = await query<User>(
    "SELECT id, email, first_name, last_name, role FROM customer WHERE deleted_at IS NULL ORDER BY last_name, first_name",
  );

  return (
    <>
      <BackLink href="/service/orders" label="Orders" />
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      {users.length === 0 ? (
        <p className="text-zinc-500">No users yet.</p>
      ) : (
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
                  <Link
                    href={`/service/users/${user.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
