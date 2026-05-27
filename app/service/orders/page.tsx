import Link from "next/link";
import { query } from "@/app/db";

type OrderRow = {
  id: number;
  customer_name: string;
  order_date: string;
  total_amount: string;
  status: string;
};

export default async function ServiceOrdersPage() {
  const orders = await query<OrderRow>(`
    SELECT o.id, c.first_name || ' ' || c.last_name AS customer_name,
           o.order_date, o.total_amount, o.status
      FROM shop_order o
      JOIN customer c ON c.id = o.user_id
     ORDER BY o.order_date DESC
  `);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-zinc-500">No orders yet.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Customer</th>
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-2">{order.id}</td>
                <td className="py-2">{order.customer_name}</td>
                <td className="py-2">
                  {new Date(order.order_date).toLocaleDateString("nl-NL")}
                </td>
                <td className="py-2 font-mono">
                  &euro;{parseFloat(order.total_amount).toFixed(2)}
                </td>
                <td className="py-2">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs">
                    {order.status}
                  </span>
                </td>
                <td className="py-2">
                  <Link
                    href={`/service/orders/${order.id}/edit`}
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
