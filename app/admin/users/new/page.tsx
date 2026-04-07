import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">New user</h1>
      <form action={createUser} className="max-w-md space-y-4">
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
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label
            htmlFor="last_name"
            className="mb-1 block text-sm font-medium"
          >
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
