"use client";

import { registerUser } from "@/app/user/actions";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await registerUser(formData);
      if (result.success) {
        router.push("/user/verify-email-sent");
      }
      return result;
    },
    { success: false, errors: [] }
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-3xl font-bold mb-6">Account aanmaken</h1>

        {state.errors && state.errors.some((e: any) => !e.field) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            {state.errors
              .filter((e: any) => !e.field)
              .map((error: any, i: number) => (
                <p key={i} className="text-red-700 text-sm">
                  {error.message}
                </p>
              ))}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Voornaam</label>
            <input
              type="text"
              name="firstName"
              placeholder="Jan"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {state.errors?.find((e: any) => e.field === "firstName") && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors?.find((e: any) => e.field === "firstName")?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Achternaam</label>
            <input
              type="text"
              name="lastName"
              placeholder="Jansen"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {state.errors?.find((e: any) => e.field === "lastName") && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors?.find((e: any) => e.field === "lastName")?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-mailadres</label>
            <input
              type="email"
              name="email"
              placeholder="je@voorbeeld.nl"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {state.errors?.find((e: any) => e.field === "email") && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors?.find((e: any) => e.field === "email")?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Wachtwoord</label>
            <input
              type="password"
              name="password"
              placeholder="••••••"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {state.errors?.find((e: any) => e.field === "password") && (
              <p className="text-red-600 text-sm mt-1">
                {state.errors?.find((e: any) => e.field === "password")?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Wachtwoord bevestigen
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••"
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {state.errors?.find((e: any) => e.field === "confirmPassword") && (
              <p className="text-red-600 text-sm mt-1">
                {
                  state.errors?.find((e: any) => e.field === "confirmPassword")
                    ?.message
                }
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Bezig..." : "Account aanmaken"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-zinc-600 text-sm mb-4">
            Al een account?
          </p>
          <Link
            href="/user/login"
            className="w-full block py-3 px-4 bg-zinc-200 text-zinc-900 rounded-lg font-medium hover:bg-zinc-300 text-center"
          >
            Inloggen
          </Link>
        </div>

        <Link href="/cart" className="block text-center text-blue-600 hover:underline text-sm mt-4">
          Terug naar winkelwagen
        </Link>
      </div>
    </div>
  );
}
