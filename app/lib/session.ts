import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "userId";
const GUEST_SESSION_COOKIE_NAME = "guestId";

export async function setUserSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function setGuestSession(guestId: string) {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_SESSION_COOKIE_NAME, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getUserSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return userId ? parseInt(userId, 10) : null;
}

export async function getGuestSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value || null;
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function clearAllSessions() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(GUEST_SESSION_COOKIE_NAME);
}
