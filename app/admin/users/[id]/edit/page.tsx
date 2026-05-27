import { notFound } from "next/navigation";
import { query } from "@/app/db";
import { updateUser } from "../../actions";
import { BackLink } from "@/app/BackLink";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await query<User>(
    "SELECT id, email, first_name, last_name, role FROM customer WHERE id = $1",
    [id],
  );
  if (rows.length === 0) notFound();
  const user = rows[0];

  return (
    <>
      <BackLink href="/admin/users" label="Users" />
      <h1 className="mb-6 text-2xl font-bold">Edit user</h1>
      <form action={updateUser} className="max-w-md space-y-4">
        <input type="hidden" name="id" value={user.id} />
        <div>
          <label
            htmlFor="first_name"
            className="mb-1 block text-sm font-medium"
          >
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            defaultValue={user.first_name}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-medium">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            defaultValue={user.last_name}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user.email}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="customer">Customer</option>
            <option value="service">Service</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Save
        </button>
      </form>
    </>
  );
}
