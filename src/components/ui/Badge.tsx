import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  colorClassName?: string;
}

export function Badge({ children, colorClassName }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        colorClassName ??
        "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
      }`}
    >
      {children}
    </span>
  );
}

