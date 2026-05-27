"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, X, User, LogOut } from "lucide-react";
import { searchBooks } from "@/app/books/search-actions";
import type { BookRow } from "@/app/books-shared";
import { CoverImage } from "@/app/cover-image";

type SearchModalProps = {
  onClose: () => void;
};

function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const searchResults = await searchBooks(query);
        setResults(searchResults);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      setResults([]);
    };
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Zoeken op titel of auteur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
            />

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <X size={18} />
            </button>
          </div>

          {query.trim() && (
            <div className="mt-4">
              {loading ? (
                <p className="text-sm text-zinc-500">Zoeken...</p>
              ) : results.length === 0 ? (
                <p className="text-sm text-zinc-500">Geen boeken gevonden.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {results.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                      onClick={onClose}
                    >
                      <div className="mb-2 aspect-[2/3] overflow-hidden rounded-lg bg-zinc-50">
                        <CoverImage
                          isbn={book.isbn}
                          id={book.id}
                          title={book.title}
                          size="M"
                        />
                      </div>

                      <p className="line-clamp-2 text-xs font-medium leading-snug group-hover:underline">
                        {book.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        €{(book.price_cents / 100).toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type HeaderProps = {
  cartCount: number;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isService: boolean;
};

export function Header({ cartCount, isAuthenticated, isAdmin, isService }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-medium text-zinc-900">
            Boekenhandel
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <Search size={18} />
            </button>

            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <ShoppingBag size={18} />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900"
              >
                <User size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg z-50">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/user/account"
                        className="block px-4 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        Mijn Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      {isService && (
                        <Link
                          href="/service"
                          className="block px-4 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          Service
                        </Link>
                      )}
                      <form
                        action="/api/auth/logout"
                        method="POST"
                        className="w-full"
                      >
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 flex items-center gap-2 text-red-600"
                        >
                          <LogOut size={16} />
                          Afmelden
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/user/login"
                        className="block px-4 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-200"
                        onClick={() => setMenuOpen(false)}
                      >
                        Inloggen
                      </Link>
                      <Link
                        href="/user/register"
                        className="block px-4 py-2 text-sm hover:bg-zinc-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Registreren
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
