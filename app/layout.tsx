import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./Header";
import { getCart } from "./cart/actions";
import { getUserSession } from "./lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boekenhandel",
  description: "Een boekwinkel voor klassiekers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserSession();
  let cartCount = 0;

  if (userId) {
    const cart = await getCart(userId);
    cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white antialiased text-zinc-900`}
      >
        <Header cartCount={cartCount} isAuthenticated={!!userId} />

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
