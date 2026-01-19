"use client";

import { toast } from "sonner";

export default function ExportExcelButton({
  columns = [],
  rows = [],
  filename = `export.xlsx`,
  sheetName = `Export`,
  className = "",
  children = "Scarica Excel",
  data
}) {
  const onExport = async () => {
    if (!columns.length) return toast.warning("colonne vuote");
    if (!rows.length) return toast.warning("nessun dato da esportare");

    const res = await fetch("/api/exportExcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns, rows, filename, sheetName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || "Errore export");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success(`dati ${data} esportati con successo`)

  };

  return (
    <button type="button" onClick={onExport} className={className}>
      {children}
    </button>
  );
}
