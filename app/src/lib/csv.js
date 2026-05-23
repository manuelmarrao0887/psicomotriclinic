// Download de dados como CSV (BOM para Excel pt-PT abrir bem).
export function downloadCsv(filename, rows, columns) {
  const escape = (v) => {
    if (v == null) return "";
    let s = String(v);
    if (/[",;\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const head = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => escape(typeof c.get === "function" ? c.get(r) : r[c.key])).join(",")).join("\n");
  const csv = head + "\n" + body;
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
