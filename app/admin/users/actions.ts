"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const password = formData.get("password") as string;
  await query(
    "INSERT INTO customer (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4)",
    [email, password, firstName, lastName]
  );
  redirect("/admin/users");
}

export async function updateUser(formData: FormData) {
  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  await query(
    "UPDATE customer SET email = $1, first_name = $2, last_name = $3 WHERE id = $4",
    [email, firstName, lastName, id]
  );
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;
  await query("DELETE FROM customer WHERE id = $1", [id]);
  redirect("/admin/users");
}
