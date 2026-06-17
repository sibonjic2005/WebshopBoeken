"use server";

import { query } from "@/app/db";
import { requireAdmin } from "@/app/lib/session";
import { redirect } from "next/navigation";

const roles = ["customer", "service", "admin"] as const;

type Role = (typeof roles)[number];

function parseRole(value: FormDataEntryValue | null): Role {
  return roles.includes(value as Role) ? (value as Role) : "customer";
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const password = formData.get("password") as string;
  const role = parseRole(formData.get("role"));
  await query(
    "INSERT INTO customer (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)",
    [email, password, firstName, lastName, role],
  );
  redirect("/admin/users");
}

export async function updateUser(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const role = parseRole(formData.get("role"));
  await query(
    "UPDATE customer SET email = $1, first_name = $2, last_name = $3, role = $4 WHERE id = $5",
    [email, firstName, lastName, role, id],
  );
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  await query(
    "UPDATE customer SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [id],
  );
  redirect("/admin/users");
}
