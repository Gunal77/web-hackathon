import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
}

export function TableContainer({ headers, children }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm">
      <div className="hidden min-w-full text-sm text-slate-800 md:table">
        <div className="table-header-group bg-surface-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="table-row">
            {headers.map((header) => (
              <div key={header} className="table-cell px-4 py-2 align-middle">
                {header}
              </div>
            ))}
          </div>
        </div>
        <div className="table-row-group">{children}</div>
      </div>
      <div className="space-y-3 p-3 text-sm text-slate-800 md:hidden">
        {children}
      </div>
    </div>
  );
}

// Backwards compatible alias
export const Table = TableContainer;

