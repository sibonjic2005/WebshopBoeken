"use client";

import { useState } from "react";

const COVER_PALETTES: [string, string][] = [
  ["#f5e6d3", "#c8845a"],
  ["#dde8d4", "#5a8c4a"],
  ["#d4ddf0", "#4a5ec8"],
  ["#f0d4d4", "#c84a4a"],
  ["#e8d4f0", "#8a4ac8"],
  ["#d4f0ec", "#4ac8b8"],
  ["#f0ead4", "#c8a84a"],
  ["#d4e8f0", "#4a8cc8"],
  ["#f0d4e8", "#c84a8a"],
];

function isbn13to10(isbn13: string): string | null {
  if (isbn13.length !== 13 || !isbn13.startsWith("978")) return null;
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(core[i], 10) * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? "X" : String(check));
}

function coverSrc(isbn: string, attempt: number, size: "S" | "M" | "L"): string | null {
  if (attempt === 0) return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  if (attempt === 1) {
    const isbn10 = isbn.length === 10 ? isbn : isbn13to10(isbn);
    if (!isbn10) return null;
    return `https://images.amazon.com/images/P/${isbn10}.01.L.jpg`;
  }
  return null;
}

export function CoverImage({
  isbn,
  id,
  title,
  size = "M",
}: {
  isbn: string;
  id: number;
  title: string;
  size?: "S" | "M" | "L";
}) {
  const [attempt, setAttempt] = useState(0);
  const [bg, text] = COVER_PALETTES[id % COVER_PALETTES.length];
  const cleanIsbn = isbn?.replace(/-/g, "");
  const src = cleanIsbn ? coverSrc(cleanIsbn, attempt, size) : null;

  if (!src) {
    return (
      <div
        className="flex aspect-[2/3] w-full flex-col items-center justify-center rounded px-3 py-4 text-center text-xs font-bold shadow-md"
        style={{ backgroundColor: bg, color: text }}
      >
        {title}
      </div>
    );
  }

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (e.currentTarget.naturalWidth < 50) setAttempt((a) => a + 1);
  }

  return (
    <img
      src={src}
      alt={title}
      className="h-full w-full object-contain drop-shadow-md"
      onLoad={handleLoad}
      onError={() => setAttempt((a) => a + 1)}
    />
  );
}
