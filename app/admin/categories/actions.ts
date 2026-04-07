"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  await query("INSERT INTO category (name, description) VALUES ($1, $2)", [
    name,
    description || null,
  ]);
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  await query("UPDATE category SET name = $1, description = $2 WHERE id = $3", [
    name,
    description || null,
    id,
  ]);
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string;
  await query("DELETE FROM category WHERE id = $1", [id]);
  redirect("/admin/categories");
}
