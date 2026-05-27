"use server";

import { query } from "@/app/db";
import { requireService } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function updateOrderStatus(formData: FormData) {
  await requireService();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  await query("UPDATE shop_order SET status = $1 WHERE id = $2", [status, id]);
  redirect("/service/orders");
}
