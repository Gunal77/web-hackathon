import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  accentColorClassName?: string;
}

export function Card({ title, children, accentColorClassName }: CardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm">
      {title && (
        <div
          className={`border-b border-surface-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
            accentColorClassName ?? ""
          }`}
        >
          {title}
        </div>
      )}
      <div className="px-4 py-3 text-sm text-slate-800">{children}</div>
    </section>
  );
}

