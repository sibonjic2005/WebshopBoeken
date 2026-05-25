"use server";

import { query } from "@/app/db";
import { setUserSession, clearUserSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import bcryptjs from "bcryptjs";

export interface AuthError {
  field?: string;
  message: string;
}

// Register a new user
export async function registerUser(
  formData: FormData
): Promise<{ success: boolean; errors?: AuthError[] }> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const firstName = formData.get("firstName")?.toString().trim();
  const lastName = formData.get("lastName")?.toString().trim();

  const errors: AuthError[] = [];

  // Validation
  if (!email || !email.includes("@")) {
    errors.push({ field: "email", message: "Voer een geldig e-mailadres in" });
  }
  if (!firstName || firstName.length < 2) {
    errors.push({
      field: "firstName",
      message: "Voornaam moet minstens 2 karakters zijn",
    });
  }
  if (!lastName || lastName.length < 2) {
    errors.push({
      field: "lastName",
      message: "Achternaam moet minstens 2 karakters zijn",
    });
  }
  if (!password || password.length < 6) {
    errors.push({
      field: "password",
      message: "Wachtwoord moet minstens 6 karakters zijn",
    });
  }
  if (password !== confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Wachtwoorden komen niet overeen",
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  try {
    // Check if email already exists
    const existingUser = await query(
      "SELECT id FROM customer WHERE email = $1",
      [email]
    );

    if (existingUser.length > 0) {
      return {
        success: false,
        errors: [{ field: "email", message: "Dit e-mailadres is al in gebruik" }],
      };
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password!, salt);

    // Create user
    const result = await query<{ id: number }>(
      `INSERT INTO customer (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, hashedPassword, firstName, lastName]
    );

    const userId = result[0].id;

    // Set session
    await setUserSession(userId);

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      errors: [{ message: "Er is een fout opgetreden tijdens registratie" }],
    };
  }
}

// Login user
export async function loginUser(
  formData: FormData
): Promise<{ success: boolean; errors?: AuthError[] }> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  const errors: AuthError[] = [];

  if (!email || !email.includes("@")) {
    errors.push({ field: "email", message: "Voer een geldig e-mailadres in" });
  }
  if (!password) {
    errors.push({ field: "password", message: "Voer uw wachtwoord in" });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  try {
    // Find user by email
    const users = await query<{
      id: number;
      password_hash: string;
    }>("SELECT id, password_hash FROM customer WHERE email = $1", [email]);

    if (users.length === 0) {
      return {
        success: false,
        errors: [{ message: "E-mailadres of wachtwoord onjuist" }],
      };
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password!, user.password_hash);

    if (!isPasswordValid) {
      return {
        success: false,
        errors: [{ message: "E-mailadres of wachtwoord onjuist" }],
      };
    }

    // Set session
    await setUserSession(user.id);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      errors: [{ message: "Er is een fout opgetreden bij het inloggen" }],
    };
  }
}

// Logout user
export async function logoutUser() {
  await clearUserSession();
  redirect("/");
}
