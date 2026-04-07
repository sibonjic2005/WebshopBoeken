"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";

export async function createOrder(formData: FormData) {
  const userId = formData.get("user_id") as string;
  const status = formData.get("status") as string;
  const bookIds = formData.getAll("book_ids") as string[];
  const quantities = formData.getAll("quantities") as string[];
  const prices = formData.getAll("prices") as string[];

  let totalAmount = 0;
  for (let i = 0; i < bookIds.length; i++) {
    totalAmount += parseFloat(prices[i]) * parseInt(quantities[i], 10);
  }

  const rows = await query<{ id: number }>(
    "INSERT INTO shop_order (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id",
    [userId, totalAmount.toFixed(2), status]
  );
  const orderId = rows[0].id;

  for (let i = 0; i < bookIds.length; i++) {
    await query(
      "INSERT INTO order_line (order_id, book_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)",
      [orderId, bookIds[i], quantities[i], prices[i]]
    );
  }

  redirect("/admin/orders");
}

export async function updateOrder(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  await query("UPDATE shop_order SET status = $1 WHERE id = $2", [status, id]);
  redirect("/admin/orders");
}

export async function deleteOrder(formData: FormData) {
  const id = formData.get("id") as string;
  await query("DELETE FROM order_line WHERE order_id = $1", [id]);
  await query("DELETE FROM shop_order WHERE id = $1", [id]);
  redirect("/admin/orders");
}
