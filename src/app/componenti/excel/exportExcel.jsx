"use client";

export default function ExportExcelButton({
  columns = [],
  rows = [],
  filename = `export.xlsx`,
  sheetName = `Export`,
  className = "",
  children = "Scarica Excel",
}) {
  const onExport = async () => {
    if (!columns.length) return alert("columns è vuoto");
    if (!rows.length) return alert("rows è vuoto");

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
  };

  return (
    <button type="button" onClick={onExport} className={className}>
      {children}
    </button>
  );
}
