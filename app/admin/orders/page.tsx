import Link from "next/link";
import { query } from "@/app/db";
import { deleteOrder } from "./actions";
import { Pagination } from "../Pagination";
import { BackLink } from "@/app/BackLink";

const PAGE_SIZE = 20;

type OrderRow = {
  id: number;
  customer_name: string;
  order_date: string;
  total_amount: string;
  status: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const {
    page: pageParam,
    search,
    status,
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
        LOWER(c.first_name || ' ' || c.last_name) LIKE $1
        OR CAST(o.id AS TEXT) LIKE $1
        OR LOWER(o.status) LIKE $1
      )
    `);
    queryParams.push(searchQuery);
  }

  if (status) {
    conditions.push(`o.status = $${queryParams.length + 1}`);
    queryParams.push(status);
  }

  if (conditions.length > 0) {
    whereClause = `WHERE ${conditions.join(" AND ")}`;
  }

  let orderClause = "o.order_date DESC";

  if (sort === "oldest") {
    orderClause = "o.order_date ASC";
  } else if (sort === "total_desc") {
    orderClause = "o.total_amount DESC";
  } else if (sort === "total_asc") {
    orderClause = "o.total_amount ASC";
  }

  const buildUrl = (params: Record<string, string | undefined>) =>
    `/admin/orders?${new URLSearchParams({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(sort ? { sort } : {}),
      ...params,
    }).toString()}`;

  const [orders, countResult] = await Promise.all([
    query<OrderRow>(
      `
      SELECT o.id,
             c.first_name || ' ' || c.last_name AS customer_name,
             o.order_date,
             o.total_amount,
             o.status
      FROM shop_order o
      JOIN customer c ON c.id = o.user_id
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
      FROM shop_order o
      JOIN customer c ON c.id = o.user_id
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
        <h1 className="text-2xl font-bold">Orders</h1>

        <Link
          href="/admin/orders/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          New order
        </Link>
      </div>

      {/* SEARCH + FILTERS */}
      <form method="GET" className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search order, customer or status..."
          defaultValue={search || ""}
          className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <select
          name="status"
          defaultValue={status || ""}
          className="rounded-lg border px-4 py-2"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-2 text-white hover:bg-zinc-700"
        >
          Filter
        </button>

        {(search || status) && (
          <Link
            href="/admin/orders"
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
          href={buildUrl({ sort: "newest" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            !sort || sort === "newest"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Newest
        </Link>

        <Link
          href={buildUrl({ sort: "oldest" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "oldest"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Oldest
        </Link>

        <Link
          href={buildUrl({ sort: "total_desc" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "total_desc"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Highest total
        </Link>

        <Link
          href={buildUrl({ sort: "total_asc" })}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            sort === "total_asc"
              ? "bg-zinc-900 text-white"
              : "border border-zinc-300 text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          Lowest total
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders found.</p>
      ) : (
        <>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th>#</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td>{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>
                    {new Date(order.order_date).toLocaleDateString(
                      "nl-NL",
                    )}
                  </td>
                  <td>
                    €{parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs">
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/admin/orders/${order.id}/edit`}>
                        Edit
                      </Link>

                      <form action={deleteOrder}>
                        <input
                          type="hidden"
                          name="id"
                          value={order.id}
                        />
                        <button className="text-red-600">
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
              basePath={`/admin/orders?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(status ? { status } : {}),
                ...(sort ? { sort } : {}),
              }).toString()}`}
            />
          </div>
        </>
      )}
    </>
  );
}