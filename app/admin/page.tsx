import Link from "next/link";

const sections = [
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Admin</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-lg border bg-white p-6 font-semibold hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
