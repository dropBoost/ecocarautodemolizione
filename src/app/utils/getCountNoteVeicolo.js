// utils/notifiche/getCountNoteVeicolo.js

import { supabase } from "@/lib/supabaseClient";

export async function getCountNoteVeicolo({ userId, ruolo }) {

  if (!userId) {
    return {
      totale: 0,
      daLeggere: 0,
    };
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const { data, error } = await supabase
    .from("note_veicolo_ritirato")
    .select(`
      id,
      attiva,
      veicolo:dati_veicolo_ritirato(
        logtrasporto:log_trasporto_veicolo(
          uuid_autista_ctv
        )
      )
    `)
    .gte("created_at", startDate.toISOString());

  if (error) {
    throw error;
  }

  let notifiche = data ?? [];

  if (ruolo === "transporter") {
    notifiche = notifiche.filter((notifica) =>
      notifica.veicolo?.logtrasporto?.some(
        (trasporto) => trasporto.uuid_autista_ctv === userId
      )
    );
  }

  return {
    totale: notifiche.length,
    daLeggere: notifiche.filter((notifica) => notifica.attiva).length,
  };
}