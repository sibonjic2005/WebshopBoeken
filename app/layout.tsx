import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import "./globals.css";
import { getCart } from "./cart/actions";

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
  const cart = await getCart(1);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white antialiased text-zinc-900`}
      >
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="text-sm font-medium text-zinc-900">
              Boekenhandel
            </Link>

            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors">
                <Search size={18} />
              </button>
              <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
