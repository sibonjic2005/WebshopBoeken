import { getUserSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/app/db";
import Link from "next/link";
import { logoutUser } from "@/app/user/actions";

export default async function AccountPage() {
  const userId = await getUserSession();

  if (!userId) {
    redirect("/user/login");
  }

  // Get user info
  const users = await query<{
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>("SELECT id, email, first_name, last_name FROM customer WHERE id = $1", [
    userId,
  ]);

  if (users.length === 0) {
    redirect("/user/login");
  }

  const user = users[0];

  async function handleLogout() {
    "use server";
    await logoutUser();
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-6">Mijn Account</h1>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-600">Naam</label>
              <p className="text-lg mt-1">
                {user.first_name} {user.last_name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-600">
                E-mailadres
              </label>
              <p className="text-lg mt-1">{user.email}</p>
            </div>

            <div className="pt-6 border-t">
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Afmelden
                </button>
              </form>
            </div>

            <div className="pt-6">
              <Link
                href="/cart"
                className="text-blue-600 hover:underline"
              >
                Terug naar winkelwagen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
