"use server";

import { query } from "@/app/db";
import { requireService } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function updateUserProfile(formData: FormData) {
  await requireService();

  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  await query(
    "UPDATE customer SET email = $1, first_name = $2, last_name = $3 WHERE id = $4",
    [email, firstName, lastName, id],
  );
  redirect("/service/users");
}
