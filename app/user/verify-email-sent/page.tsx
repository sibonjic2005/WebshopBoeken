"use client";

import { useState } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "@/app/user/actions";

export default function VerifyEmailSentPage() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setResendMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    const result = await resendVerificationEmail(email);
    setIsResending(false);

    if (result.success) {
      setResendMessage("Verification email sent! Check your inbox.");
      setEmail("");
    } else {
      setResendMessage(
        result.errors?.[0]?.message || "Failed to resend email"
      );
    }

    setTimeout(() => setResendMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-zinc-600">
            We've sent a verification link to your email address. Click the link
            to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Didn't receive the email?</strong>
              <br />
              Check your spam folder or request a new verification link below.
            </p>
          </div>

          {resendMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                resendMessage.includes("sent")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleResend} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            <button
              type="submit"
              disabled={isResending}
              className="w-full bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend Verification Email"}
            </button>
          </form>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-zinc-600 mb-2">
              Already verified?
            </p>
            <Link
              href="/user/login"
              className="text-zinc-900 font-medium hover:underline"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
