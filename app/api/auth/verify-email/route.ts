"use server";

import { query } from "@/app/db";
import { verifyToken, deleteVerificationToken } from "@/app/lib/email-verification";
import { redirect } from "next/navigation";

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
