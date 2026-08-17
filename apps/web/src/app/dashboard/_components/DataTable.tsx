import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  empty?: ReactNode;
}

export function DataTable<T>({ columns, rows, getRowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return empty || null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-soft text-ink-soft">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`px-4 py-3 font-semibold ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)} className="bg-surface hover:bg-canvas">
              {columns.map((col) => {
                const cell = col.render
                  ? col.render(row, index)
                  : col.accessor
                    ? String(row[col.accessor] ?? "")
                    : null;
                return (
                  <td key={col.key} className={`px-4 py-3 text-ink ${col.className || ""}`}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
