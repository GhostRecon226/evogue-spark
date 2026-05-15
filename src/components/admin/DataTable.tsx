import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyMessage?: string;
  emptyState?: ReactNode;
  rowKey: (row: T) => string;
  initialSort?: { key: string; direction: "asc" | "desc" };
  actions?: (row: T) => ReactNode;
  alwaysShowHeader?: boolean;
};

export function DataTable<T>({
  rows, columns, pageSize = 10, emptyMessage = "No records found.", emptyState,
  rowKey, initialSort, actions, alwaysShowHeader,
}: Props<T>) {
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
    });
    if (sort.direction === "desc") copy.reverse();
    return copy;
  }, [rows, columns, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const slice = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: string) => {
    setSort((cur) => {
      if (!cur || cur.key !== key) return { key, direction: "asc" };
      if (cur.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-mint-tint/60 text-forest">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`text-left font-bold px-4 py-3 ${c.className ?? ""}`}>
                  {c.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-secondary transition"
                    >
                      {c.header}
                      {sort?.key === c.key
                        ? sort.direction === "asc"
                          ? <ArrowUp className="h-3.5 w-3.5" />
                          : <ArrowDown className="h-3.5 w-3.5" />
                        : <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
              {actions && <th className="text-right font-bold px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-10 text-center text-foreground/55">
                  {emptyState ?? emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={rowKey(row)} className="border-t border-border/60 hover:bg-mint-tint/30">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-foreground/85 ${c.className ?? ""}`}>
                      {c.cell ? c.cell(row) : (c.accessor(row) ?? "—")}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background">
          <p className="text-xs text-foreground/60">
            Page {safePage + 1} of {totalPages} · {sorted.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full"
              onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function parsePrice(input: string | null | undefined): number {
  if (!input) return 0;
  const cleaned = String(input).replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatNaira(n: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₦${n.toLocaleString()}`;
  }
}
