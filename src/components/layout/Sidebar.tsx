import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/collector/dashboard", label: "Collector dashboard" },
  { href: "/collector/department-performance", label: "Department Performance" },
  { href: "/collector/district-performance", label: "District Performance" },
  { href: "/collector/prediction", label: "Prediction" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-surface-100 bg-white px-4 py-5 shadow-sm md:flex">
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-xs font-semibold text-white shadow-sm">
          RM
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            TN Governance
          </div>
          <div className="text-sm font-semibold text-slate-900">
            Risk &amp; Sentiment Manu
          </div>
        </div>
      </div>

      <nav className="mt-2 space-y-1 text-sm font-medium text-slate-700">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const baseClasses =
            "flex items-center gap-3 rounded-xl px-3 py-2 transition";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${baseClasses} ${
                active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-surface-100"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-semibold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.label
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

