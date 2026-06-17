import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { cache } from "react";
import { redirect } from "next/navigation";
import { query } from "../db";
import { redis } from "./redis";

const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type CurrentUser = {
  id: number;
  role: string;
};

function newToken() {
  return randomBytes(32).toString("base64url");
}

export async function setUserSession(userId: number) {
  const token = newToken();
  await redis.set(
    `session:${token}`,
    String(userId),
    "EX",
    SESSION_TTL_SECONDS,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function getUserSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const userId = await redis.get(`session:${token}`);
  return userId ? parseInt(userId, 10) : null;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getUserSession();
  if (!userId) return null;

  const users = await query<CurrentUser>(
    "SELECT id, role FROM customer WHERE id = $1 AND deleted_at IS NULL",
    [userId],
  );

  return users[0] ?? null;
});

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/user/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function requireService(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/user/login");
  }

  if (user.role !== "service" && user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await redis.del(`session:${token}`);
  cookieStore.delete(SESSION_COOKIE_NAME);
}
