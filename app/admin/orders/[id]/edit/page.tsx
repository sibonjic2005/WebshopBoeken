import { notFound } from "next/navigation";
import { query } from "@/app/db";
import { updateOrder } from "../../actions";

type Order = {
  id: number;
  customer_name: string;
  order_date: string;
  total_amount: string;
  status: string;
};

type OrderLine = {
  book_title: string;
  quantity: number;
  price_at_purchase: string;
};

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [orderRows, lines] = await Promise.all([
    query<Order>(
      `SELECT o.id, c.first_name || ' ' || c.last_name AS customer_name,
              o.order_date, o.total_amount, o.status
         FROM shop_order o
         JOIN customer c ON c.id = o.user_id
        WHERE o.id = $1`,
      [id]
    ),
    query<OrderLine>(
      `SELECT b.title AS book_title, ol.quantity, ol.price_at_purchase
         FROM order_line ol
         JOIN book b ON b.id = ol.book_id
        WHERE ol.order_id = $1`,
      [id]
    ),
  ]);

  if (orderRows.length === 0) notFound();
  const order = orderRows[0];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Order #{order.id}</h1>

      <div className="mb-6 max-w-md space-y-2 text-sm">
        <p>
          <span className="font-medium">Customer:</span> {order.customer_name}
        </p>
        <p>
          <span className="font-medium">Date:</span>{" "}
          {new Date(order.order_date).toLocaleDateString("nl-NL")}
        </p>
        <p>
          <span className="font-medium">Total:</span> &euro;
          {parseFloat(order.total_amount).toFixed(2)}
        </p>
      </div>

      {lines.length > 0 && (
        <table className="mb-6 w-full max-w-md text-left text-sm">
          <thead>
            <tr className="border-b dark:border-zinc-800">
              <th className="pb-2 font-medium">Book</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-b dark:border-zinc-800">
                <td className="py-2">{line.book_title}</td>
                <td className="py-2">{line.quantity}</td>
                <td className="py-2 font-mono">
                  &euro;{parseFloat(line.price_at_purchase).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form action={updateOrder} className="max-w-md space-y-4">
        <input type="hidden" name="id" value={order.id} />
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={order.status}
            className="w-full rounded-lg border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Update status
        </button>
      </form>
    </>
  );
}
