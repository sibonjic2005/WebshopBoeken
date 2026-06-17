import { getUserSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/app/db";
import Link from "next/link";
import { logoutUser } from "@/app/user/actions";

type Order = {
  id: number;
  order_date: string;
  total_amount: string;
  status: string;
};

type OrderLine = {
  order_id: number;
  book_title: string;
  quantity: number;
  price_at_purchase: string;
};

export default async function AccountPage() {
  const userId = await getUserSession();

  if (!userId) {
    redirect("/user/login");
  }

  const users = await query<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>(
    "SELECT id, email, first_name, last_name FROM customer WHERE id = $1 AND deleted_at IS NULL",
    [userId],
  );

  if (users.length === 0) {
    redirect("/user/login");
  }

  const user = users[0];

  const orders = await query<Order>(
    "SELECT id, order_date, total_amount, status FROM shop_order WHERE user_id = $1 ORDER BY order_date DESC",
    [userId]
  );

  const orderLines =
    orders.length > 0
      ? await query<OrderLine>(
          `SELECT ol.order_id, b.title AS book_title, ol.quantity, ol.price_at_purchase
           FROM order_line ol
           JOIN book b ON b.id = ol.book_id
           WHERE ol.order_id = ANY($1)`,
          [orders.map((o) => o.id)]
        )
      : [];

  const linesByOrder = orderLines.reduce<Record<number, OrderLine[]>>(
    (acc, line) => {
      (acc[line.order_id] ??= []).push(line);
      return acc;
    },
    {}
  );

  async function handleLogout() {
    "use server";
    await logoutUser();
  }

  const statusLabel: Record<string, string> = {
    pending: "In behandeling",
    shipped: "Verzonden",
    delivered: "Geleverd",
    cancelled: "Geannuleerd",
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Account info */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Mijn Account</h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Naam</p>
              <p className="mt-0.5">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">E-mailadres</p>
              <p className="mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex items-center gap-4">
            <form action={handleLogout}>
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 text-white text-sm rounded hover:bg-zinc-700"
              >
                Afmelden
              </button>
            </form>
            <Link href="/cart" className="text-sm text-zinc-500 hover:text-zinc-900">
              Winkelwagen
            </Link>
          </div>
        </div>

        {/* Order history */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Bestellingen</h2>

          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500">Je hebt nog geen bestellingen geplaatst.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">#{order.id}</span>
                      <span className="text-sm text-zinc-500">
                        {new Date(order.order_date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-zinc-100 text-zinc-600 rounded">
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>

                  <ul className="text-sm text-zinc-600 space-y-1 mb-3">
                    {(linesByOrder[order.id] ?? []).map((line, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{line.quantity}× {line.book_title}</span>
                        <span>€{(parseFloat(line.price_at_purchase) * line.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-end border-t pt-2 text-sm font-medium">
                    Totaal: €{parseFloat(order.total_amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
