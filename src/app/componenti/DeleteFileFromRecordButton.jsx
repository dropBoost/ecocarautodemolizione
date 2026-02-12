"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function DeleteFilesWithBucketsButton({
  table,
  idColumn,
  uuid,
  targa,
  storage = [],
  label = "Rimuovi allegati",
  className = "px-2 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-xs",
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  const handleDeleteFiles = async () => {
    if (!uuid) {
      toast.error("UUID mancante.");
      return;
    }

    if (!Array.isArray(storage) || storage.length === 0) {
      toast.error("Nessun bucket/cartella specificata (storage vuoto).");
      return;
    }

    const lines = storage
      .map((op) => `- ${op.bucket}/${op.folder ?? "(vuoto)"}`)
      .join("\n");

    const ok = window.confirm(
      `Confermi la rimozione dei documenti allegati della pratica ${
        targa || uuid || ""
      }?\n\n${lines}\n\nVerranno anche svuotati i campi nel database.`
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/deleteFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage,
          table,
          idColumn,
          uuid,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.error || "Errore rimozione file");
        return;
      }

      toast.success(
        `Fatto! File rimossi: ${json?.removedTotal ?? 0}${
          json?.dbUpdatedDati ? " | foto DB: OK" : " | foto DB: SKIP"
        }${
          json?.dbUpdatedCert ? " | doc demolizione: OK" : " | doc demolizione: SKIP"
        }`
      );

      onDeleted?.(json);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Errore rimozione file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDeleteFiles}
      disabled={loading}
      className={`${className} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      title="Elimina immagini e svuota campi"
    >
      {loading ? <Spinner className="size-2" /> : label}
    </button>
  );
}
