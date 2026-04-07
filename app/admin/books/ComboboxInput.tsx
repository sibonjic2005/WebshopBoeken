"use client";

import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string };

export default function ComboboxInput({
  name,
  options,
  multiple = false,
  placeholder = "Type to search or add...",
  defaultValue = [],
}: {
  name: string;
  options: Option[];
  multiple?: boolean;
  placeholder?: string;
  defaultValue?: Option[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Option[]>(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((s) => s.value === o.value)
  );

  const trimmed = query.trim();
  const exactMatch = options.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase()
  );
  const showCreate = trimmed.length > 0 && !exactMatch;

  const items: { type: "option" | "create"; option?: Option; label: string }[] =
    [
      ...filtered.map((o) => ({
        type: "option" as const,
        option: o,
        label: o.label,
      })),
      ...(showCreate
        ? [{ type: "create" as const, label: `Add "${trimmed}"` }]
        : []),
    ];

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(option: Option) {
    if (multiple) {
      setSelected((prev) => [...prev, option]);
    } else {
      setSelected([option]);
    }
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function createAndPick() {
    const newOption: Option = { value: `new:${trimmed}`, label: trimmed };
    pick(newOption);
  }

  function remove(value: string) {
    setSelected((prev) => prev.filter((s) => s.value !== value));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items.length > 0) {
        const item = items[highlightIndex];
        if (item.type === "create") {
          createAndPick();
        } else if (item.option) {
          pick(item.option);
        }
      }
    } else if (
      e.key === "Backspace" &&
      query === "" &&
      selected.length > 0 &&
      multiple
    ) {
      setSelected((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {selected.map((s) => (
        <input key={s.value} type="hidden" name={name} value={s.value} />
      ))}

      <div className="flex flex-wrap gap-1 rounded-lg border px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
        {selected.map((s) => (
          <span
            key={s.value}
            className="inline-flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-sm dark:bg-zinc-700"
          >
            {s.label}
            <button
              type="button"
              onClick={() => remove(s.value)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              ×
            </button>
          </span>
        ))}
        {(multiple || selected.length === 0) && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="min-w-[120px] flex-1 bg-transparent py-0.5 text-sm outline-none"
          />
        )}
      </div>

      {open && items.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          {items.map((item, i) => (
            <li
              key={item.type === "create" ? "__create__" : item.option!.value}
              onMouseDown={(e) => {
                e.preventDefault();
                if (item.type === "create") {
                  createAndPick();
                } else {
                  pick(item.option!);
                }
              }}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === highlightIndex
                  ? "bg-zinc-100 dark:bg-zinc-700"
                  : ""
              } ${item.type === "create" ? "italic text-zinc-500" : ""}`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
