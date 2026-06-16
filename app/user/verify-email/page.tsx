"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmailToken } from "@/app/user/actions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "no-token"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const verify = async () => {
      const result = await verifyEmailToken(token);
      if (result.success) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        // Redirect to login after 2 seconds
        setTimeout(() => router.push("/user/login"), 2000);
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying Email</h1>
            <p className="text-zinc-600">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">
              Email Verified!
            </h1>
            <p className="text-zinc-600 mb-4">{message}</p>
            <p className="text-sm text-zinc-500">
              Redirecting to login page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">
              Verification Failed
            </h1>
            <p className="text-zinc-600 mb-6">{message}</p>
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">
                The verification link may have expired. Try registering again or
                requesting a new verification email.
              </p>
              <Link
                href="/user/register"
                className="inline-block w-full bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 transition"
              >
                Back to Register
              </Link>
            </div>
          </>
        )}

        {status === "no-token" && (
          <>
            <div className="text-4xl mb-4">!</div>
            <h1 className="text-2xl font-bold mb-2">No Verification Token</h1>
            <p className="text-zinc-600 mb-6">
              It looks like the verification link is incomplete or invalid.
            </p>
            <Link
              href="/user/register"
              className="inline-block w-full bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 transition"
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
