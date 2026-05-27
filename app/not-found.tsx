import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-24 text-center">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="mx-auto mt-2 max-w-md text-4xl font-bold leading-tight tracking-tight">
        Pagina niet gevonden.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-500">
        De pagina die je zoekt bestaat niet of is verplaatst.
      </p>

      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium underline underline-offset-4 hover:no-underline"
      >
        Terug naar de boekenhandel
      </Link>
    </section>
  );
}
