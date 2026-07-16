'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"
import { FaCircle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { FieldDescription } from "@/components/ui/field";
import { DataFormat } from "@/app/componenti-sito/dataFormat";
import TargaDesign from "@/app/componenti/targaDesign";
import { Button } from "@/components/ui/button";
import { FaBullseye } from "react-icons/fa";
import { toast } from "sonner";

export default function SECTIONveicoliRitiratiTrasporto ({utente}) {

  const [notifiche, setNotifiche] = useState([])
  const [updateNote, setUpdateNote] = useState(0)
  const [notificheTotali, setNotificheTotali] = useState(0)
  const [notificheLeggere, setNotificheLeggere] = useState(0)
  const user = utente?.utente
  const role = utente?.utente?.user_metadata?.ruolo

  console.log("da",user?.id)
  console.log(role)


  // NOTE VEICOLO
  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const { data: note, error, count } = await supabase
        .from("note_veicolo_ritirato")
        .select(`
          *,
          veicolo:dati_veicolo_ritirato(
            targa_veicolo_ritirato,
            uuid_veicolo_ritirato,
            veicolo_ritirato,
            modello:modello_veicolo(
              modello,
              marca
              ),
            logtrasporto:log_trasporto_veicolo(
              uuid_autista_ctv,
              uuid_veicolo_ritirato
            )
          )
        `)
        .gte("created_at", startDate.toISOString())
        .order("attiva", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Errore caricamento notifiche");
        return;
      }

      const notifiche = note ?? [];

      if (role === "transporter") {
        const notificheAutista = notifiche.filter((notifica) =>
          notifica.veicolo?.logtrasporto?.some(
            (trasporto) => trasporto.uuid_autista_ctv === user.id
          )
        );

        const notLegg = notificheAutista.filter(a => a.attiva === true).length

        setNotifiche(notificheAutista)
        setNotificheTotali(notificheAutista.length)
        setNotificheLeggere(notLegg)
        return;
      }
      
      const notLegg = notifiche.filter(a => a.attiva === true).length

      setNotifiche(notifiche)
      setNotificheTotali(notifiche.length)
      setNotificheLeggere(notLegg)

    })();
  }, [user?.id, role, updateNote]);

  const eliminaNotifica = async (id) => {
    const { error } = await supabase
      .from("note_veicolo_ritirato")
      .update({ attiva: false })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Errore durante lettura della notifica");
      return;
    }

    // Aggiorna lo stato locale senza ricaricare tutto
    setUpdateNote(prev => prev+1)

    toast.success("Notifica letta");
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {/* CONTEGGIO */}
      <div className={`flex flex-row items-center border ${notificheLeggere > 0 ? "border-red-700 dark:border-red-700" : "border-neutral-300 dark:border-neutral-800"} rounded-lg p-4 gap-2 text-xs`}>
        <span>Notifiche da Leggere:</span>
        <span>{notificheLeggere} / {notificheTotali}</span>
      </div>
      {/* NOTE */}
      {notifiche.length > 0 ?
      <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
          {notifiche.map(n => (
            <div className={`flex flex-col border border-neutral-300 dark:border-neutral-800 rounded-lg p-4 gap-2`} key={n.id}>
              <div className="flex flex-row items-center text-sm font-semibold gap-2">
                {n.attiva && <FaCircle className="text-[0.5rem] text-red-700"/> }
                <div className="w-fit">
                  <TargaDesign targa={n.veicolo.targa_veicolo_ritirato}/>
                </div>
                <span className="text-xs">{n.veicolo.modello.marca} {n.veicolo.modello.modello}</span>
              </div>
              <div className="flex flex-row items-center justify-between">
                <p className="text-sm font-medium">{n.nota}</p>
              </div>
              <Separator/>
              <div className="flex flex-row items-center justify-between">
                <FieldDescription className={`italic text-xs`}>{DataFormat(n.created_at)}</FieldDescription>
                {n.attiva && <Button variant="ghost" size={`sm`} className="p-0 text-red-500 !hover:bg-none" onClick={() => eliminaNotifica(n.id)}> <FaBullseye/> </Button>}
              </div>
            </div>
            ))}
          </div>
      </div> : 
      <div className="flex flex-col gap-2 w-full">
        <span>Nessuna notifica da leggere</span>
      </div>}
    </div>
  )
}