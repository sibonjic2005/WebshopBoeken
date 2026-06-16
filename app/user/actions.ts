"use server";

import { query } from "@/app/db";
import { setUserSession, clearUserSession } from "@/app/lib/session";
import {
  storeVerificationCode,
  sendVerificationEmail,
  verifyToken,
  deleteVerificationToken,
} from "@/app/lib/email-verification";
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
      `INSERT INTO customer (email, password_hash, first_name, last_name, email_verified)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id`,
      [email, hashedPassword, firstName, lastName]
    );

    const userId = result[0].id;

    // Generate verification token and send email
    try {
      const token = storeVerificationCode(email);
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/user/verify-email?token=${token}`;

      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email sending fails
      // User can resend later
    }

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
      email_verified: boolean;
    }>(
      "SELECT id, password_hash, email_verified FROM customer WHERE email = $1",
      [email]
    );

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

    // Check if email is verified
    if (!user.email_verified) {
      return {
        success: false,
        errors: [
          {
            message:
              "Please verify your email first. Check your inbox for the verification link.",
          },
        ],
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

// Resend verification email
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; errors?: AuthError[] }> {
  try {
    // Find user by email
    const users = await query<{
      id: number;
      email_verified: boolean;
    }>("SELECT id, email_verified FROM customer WHERE email = $1", [email]);

    if (users.length === 0) {
      return {
        success: false,
        errors: [{ message: "User not found" }],
      };
    }

    if (users[0].email_verified) {
      return {
        success: false,
        errors: [{ message: "Email is already verified" }],
      };
    }

    // Generate new verification token and send email
    try {
      const token = storeVerificationCode(email);
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/user/verify-email?token=${token}`;

      await sendVerificationEmail(email, verificationUrl);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return {
        success: false,
        errors: [{ message: "Failed to send verification email" }],
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      errors: [{ message: "An error occurred" }],
    };
  }
}

// Verify email token
export async function verifyEmailToken(token: string) {
  try {
    // Verify the token
    const email = verifyToken(token);
    if (!email) {
      return {
        success: false,
        error: "Verification link is invalid or has expired",
      };
    }

    // Update user's email_verified status
    const result = await query(
      "UPDATE customer SET email_verified = true WHERE email = $1 RETURNING id",
      [email]
    );

    if (result.length === 0) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Clean up the used token
    deleteVerificationToken(token);

    return { success: true };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      error: "An error occurred during verification",
    };
  }
}

// Logout user
export async function logoutUser() {
  await clearUserSession();
  redirect("/");
}
