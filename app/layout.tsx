import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./Header";
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
        <Header cartCount={cartCount} />

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
