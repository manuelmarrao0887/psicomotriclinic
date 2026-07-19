// Escapa um valor para CSV (aspas, vírgulas, ponto-e-vírgula, quebras de linha).
export const escapeCsv = (v) => {
  if (v == null) return "";
  let s = String(v);
  if (/[",;\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};

// Serializa linhas+colunas em texto CSV (puro, testável). Cada coluna tem
// { label, key } ou { label, get(row) }.
export function toCsv(rows, columns) {
  const head = columns.map((c) => escapeCsv(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => escapeCsv(typeof c.get === "function" ? c.get(r) : r[c.key])).join(","))
    .join("\n");
  return head + "\n" + body;
}

// Download de dados como CSV (BOM para Excel pt-PT abrir bem).
export function downloadCsv(filename, rows, columns) {
  const csv = toCsv(rows, columns);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
