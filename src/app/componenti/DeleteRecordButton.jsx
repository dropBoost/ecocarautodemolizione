"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function DeleteRecordWithBucketsButton({
  // DB
  table,
  idColumn = "uuid",
  uuid,
  targa,
  storage = [],
  label,
  className = "px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700",
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!table || !uuid) {
      toast.error("Parametri mancanti (table/uuid)");
      return;
    }

    if (!Array.isArray(storage) || storage.length === 0) {
      const ok = window.confirm(`Confermi eliminazione della pratica ${targa}? (nessun file da rimuovere)`);
      if (!ok) return;
    } else {
      const lines = storage
        .map((op) => `- ${op.bucket}/${op.folder ?? (op.filePaths?.[0] ? "(paths)" : "(vuoto)")}`)
        .join("\n");

      const ok = window.confirm(`Confermi eliminazione della pratica ${targa} e i suoi relativi documenti? \n\nFile:\n${lines}`);
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deletePratica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table,
          idColumn,
          uuid,
          storage,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.error || "Errore eliminazione");
        return;
      }

      toast.success(`Eliminato! File rimossi: ${json?.removedTotal ?? 0}`);
      onDeleted?.(json);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`${className} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {loading ? "Elimino..." : label}
    </button>
  );
}
