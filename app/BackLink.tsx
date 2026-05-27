import Link from "next/link";

type Props = { href: string; label: string };

export function BackLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
    >
      ← {label}
    </Link>
  );
}
