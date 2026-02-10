"use client";

import { useRef, useState, useEffect } from "react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  "data-testid"?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className = "",
  "data-testid": dataTestId
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    query.trim() === ""
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().includes(query.toLowerCase().trim())
        );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </label>
      )}
      <button
        type="button"
        data-testid={dataTestId}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setQuery("");
        }}
        className="mt-1 flex w-full min-w-[220px] items-center justify-between gap-2 rounded-lg border border-surface-100 bg-white px-3 py-2 text-left text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <span className="truncate">{value || placeholder}</span>
        <span className="text-slate-400" aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-hidden rounded-lg border border-surface-100 bg-white shadow-lg">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search districts..."
            className="w-full border-b border-surface-100 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No districts match
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface-50 ${
                    opt === value ? "bg-brand-50 font-medium text-slate-900" : "text-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
