import { requireService } from "../lib/session";

export default async function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireService();

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="mb-8 flex gap-6 border-b border-zinc-200 pb-4 text-sm">
        <a href="/service/orders" className="font-medium text-zinc-900 hover:underline">
          Orders
        </a>
        <a href="/service/users" className="font-medium text-zinc-900 hover:underline">
          Users
        </a>
      </nav>
      {children}
    </div>
  );
}
