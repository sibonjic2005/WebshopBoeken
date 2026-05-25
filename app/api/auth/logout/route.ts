import { clearUserSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function POST() {
  await clearUserSession();
  redirect("/");
}
