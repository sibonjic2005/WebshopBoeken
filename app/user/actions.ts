"use server";

import { query } from "@/app/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";


export async function createUser(formData: FormData) {
      const email     = formData.get("email")      as string;
      const firstName = formData.get("first_name") as string;
      const lastName  = formData.get("last_name")  as string;
      const password  = formData.get("password")   as string;
      const confirm   = formData.get("confirm_password") as string;

      if (password !== confirm) {
        return { error: "Passwords do not match." };
      }

      if (password.length < 8) {
        return { error: "Password must be at least 8 characters." };
      }

      const existing = await query(
        "SELECT id FROM customer WHERE email = $1",
        [email]
      );
      if (existing.length > 0) {
        return { error: "An account with this email already exists." };
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const result = await query(
        `INSERT INTO customer (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [email, passwordHash, firstName, lastName]
      );

      const customerId = result[0].id;

      //Create session cookie so the user is logged in straight after registering
      (await cookies()).set("session_user_id", String(customerId), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      redirect("/dashboard");
}


export async function loginUser(formData: FormData) {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const result = await query(
        "SELECT id, password_hash FROM customer WHERE email = $1",
        [email]
      );

      if (result.length === 0) {
            return { error: "Invalid email or password." };
      }

      const customer = result[0];
      const passwordMatch = await bcrypt.compare(password, customer.password_hash);

      if (!passwordMatch) {
        return { error: "Invalid email or password." };
      }

      (await cookies()).set("session_user_id", String(customer.id), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      redirect("/dashboard");
}

export async function logoutUser() {
      (await cookies()).delete("session_user_id");
      redirect("/auth/login");
}

export async function getSession() {
      const cookieStore = await cookies();
      const userId = cookieStore.get("session_user_id")?.value;
      if (!userId) return null;

      const result = await query(
        "SELECT id, email, first_name, last_name FROM customer WHERE id = $1",
        [userId]
      );

      return result[0] ?? null;
}





