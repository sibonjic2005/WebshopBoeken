import { query } from "@/app/db";
import { createOrder } from "../actions";

type User = { id: number; first_name: string; last_name: string };
type Book = { id: number; title: string; price_cents: number };

export default async function NewOrderPage() {
  const [users, books] = await Promise.all([
    query<User>(
      "SELECT id, first_name, last_name FROM customer ORDER BY last_name, first_name"
    ),
    query<Book>("SELECT id, title, price_cents FROM book ORDER BY title"),
  ]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">New order</h1>
      <form action={createOrder} className="max-w-md space-y-4">
        <div>
          <label htmlFor="user_id" className="mb-1 block text-sm font-medium">
            Customer
          </label>
          <select
            id="user_id"
            name="user_id"
            required
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select customer</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">Order lines</legend>
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-2 rounded border px-3 py-2 text-sm dark:border-zinc-700"
            >
              <span className="flex-1">{book.title}</span>
              <input type="hidden" name="book_ids" value={book.id} />
              <input
                type="hidden"
                name="prices"
                value={(book.price_cents / 100).toFixed(2)}
              />
              <label className="text-xs text-zinc-500">Qty:</label>
              <input
                name="quantities"
                type="number"
                min={0}
                defaultValue={0}
                className="w-16 rounded border px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          ))}
        </fieldset>
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
