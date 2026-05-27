import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

export function Pagination({ page, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center gap-2 text-sm">
      {page > 1 ? (
        <Link
          href={`${basePath}?page=${page - 1}`}
          className="rounded border px-3 py-1 hover:bg-zinc-50"
        >
          ← Vorige
        </Link>
      ) : (
        <span className="rounded border px-3 py-1 text-zinc-300">← Vorige</span>
      )}

      <span className="text-zinc-500">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={`${basePath}?page=${page + 1}`}
          className="rounded border px-3 py-1 hover:bg-zinc-50"
        >
          Volgende →
        </Link>
      ) : (
        <span className="rounded border px-3 py-1 text-zinc-300">Volgende →</span>
      )}
    </div>
  );
}
