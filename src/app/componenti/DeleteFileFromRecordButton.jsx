"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function DeleteFilesWithBucketsButton({
  uuid,
  targa,
  storage = [],
  label = "Rimuovi allegati",
  className = "px-2 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-xs",
  onDone,
}) {
  const [loading, setLoading] = useState(false);

  const handleDeleteFiles = async () => {
    if (!Array.isArray(storage) || storage.length === 0) {
      toast.error("Nessun bucket/cartella specificata (storage vuoto).");
      return;
    }

    // (facoltativo) testo dettagliato
    const lines = storage
      .map((op) => `- ${op.bucket}/${op.folder ?? "(vuoto)"}`)
      .join("\n");

    const ok = window.confirm(
      `Confermi la rimozione dei documenti allegati della pratica ${targa || uuid || ""}?\n\n${lines}`
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/deletePratica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage, // ✅ ora l’API usa solo questo
          // uuid, targa // se vuoi, puoi mandarli per log lato server, ma non servono
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.error || "Errore rimozione file");
        return;
      }

      toast.success(`Allegati rimossi! File: ${json?.removedTotal ?? 0}`);
      onDone?.(json);
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
    >
      {loading ? <Spinner className="size-2" /> : label}
    </button>
  );
}
