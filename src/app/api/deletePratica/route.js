export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED_TABLES = [
  "dati_veicolo_ritirato",
  "azienda_ritiro_veicoli",
  "autista_camion_trasporto_veicoli",
];

// Lista ricorsiva di TUTTI i file sotto un prefisso (folder)
async function listAllFilesRecursive(bucket, prefix) {
  const files = [];

  async function walk(currentPrefix) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(currentPrefix, { limit: 1000 });

    if (error) throw error;

    for (const item of data ?? []) {
      if (!item?.name) continue;

      // ✅ In storage: i file hanno quasi sempre item.id valorizzato
      if (item.id) {
        files.push(`${currentPrefix}/${item.name}`);
      } else {
        // cartella
        await walk(`${currentPrefix}/${item.name}`);
      }
    }
  }

  await walk(prefix);
  return files;
}

export async function POST(req) {
  try {
    const body = await req.json();

    const table = body?.table;
    const idColumn = body?.idColumn || "uuid";
    const uuid = body?.uuid;

    // storage: [{ bucket, folder }]
    const storageOps = Array.isArray(body?.storage) ? body.storage : [];

    if (!table || !uuid) {
      return NextResponse.json(
        { error: "Parametri mancanti: table/uuid" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Tabella non consentita" }, { status: 403 });
    }

    let removedTotal = 0;
    const removedDetail = [];

    // 1) Cancello tutto in ogni folder richiesto (ricorsivo)
    for (const op of storageOps) {
      const bucket = op?.bucket;
      const folder = op?.folder;

      if (!bucket || !folder) {
        removedDetail.push({ bucket: bucket ?? null, removed: 0, note: "missing bucket/folder" });
        continue;
      }

      // prendo tutti i file sotto folder (anche sottocartelle)
      let pathsToRemove = [];
      try {
        pathsToRemove = await listAllFilesRecursive(bucket, folder);
      } catch (e) {
        return NextResponse.json(
          { error: `Errore list ricorsiva (${bucket}): ${e.message || String(e)}` },
          { status: 400 }
        );
      }

      if (!pathsToRemove.length) {
        removedDetail.push({ bucket, removed: 0 });
        continue;
      }

      // remove in batch (per sicurezza a chunk)
      const CHUNK = 200;
      for (let i = 0; i < pathsToRemove.length; i += CHUNK) {
        const chunk = pathsToRemove.slice(i, i + CHUNK);
        const { error: rmErr } = await supabaseAdmin.storage.from(bucket).remove(chunk);
        if (rmErr) {
          return NextResponse.json(
            { error: `Errore delete storage (${bucket}): ${rmErr.message}` },
            { status: 400 }
          );
        }
      }

      removedTotal += pathsToRemove.length;
      removedDetail.push({ bucket, removed: pathsToRemove.length });
    }

    // 2) Cancello il record DB
    const { error: delErr } = await supabaseAdmin
      .from(table)
      .delete()
      .eq(idColumn, uuid);

    if (delErr) {
      return NextResponse.json(
        { error: `Errore delete record: ${delErr.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, removedTotal, removedDetail });
  } catch (e) {
    console.error("[delete-record-with-files] error:", e);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
