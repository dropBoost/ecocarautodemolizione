"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPlusSquare, FaCar, FaMinusSquare, FaUser } from "react-icons/fa";
import { FaBarcode, FaBuildingCircleArrowRight, FaCircleCheck } from "react-icons/fa6";
import { useAdmin } from "@/app/admin/components/AdminContext";
import TargaDesign from "@/app/componenti/targaDesign";
import ButtonDeletePratica from "@/app/componenti/buttonDeletePratica";

export default function SECTIONcronologiaTrasporti({ onDisplay, setStatusAziende, statusAziende }) {
  const utente = useAdmin();
  const role = utente?.utente?.user_metadata.ruolo;
  const uuidUtente = utente?.utente?.id;
  const [updateList, setUpdateList] = useState(true);
  const [veicoliDaRitirare, setVeicoliDaRitirare] = useState([]);
  const [veicoliRitirati, setVeicoliRitirati] = useState([]);
  const [camion, setCamion] = useState([]);
  const [autisti, setAutisti] = useState([]);
  const [formData, setFormData] = useState({
    camionRitiro: "",
    autistaRitiro: "",
    filtroData: dataOggiItalia(),
  });
  const isAdmin = role === "admin" || role === "superadmin";
  const isTrasporter = role === "transporter";
  const isCompany = role === "company";

  //GESTIONE DATA PER QUERY

  function dataOggiItalia() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function DataFormat(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d)) return '—'
    return d.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
  } 

  //CARICAMENTO VEICOLI RITIRATI CRONOLOGIA
  useEffect(() => {

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("log_trasporto_veicolo")
        .select(`*,
          camion:camion_trasporto_veicoli(targa_camion),
          autista:autista_camion_trasporto_veicoli(nome_autista,cognome_autista),
          veicoloRitirato:dati_veicolo_ritirato!inner(
            targa_veicolo_ritirato,
            veicolo_consegnato,
            uuid_azienda_ritiro_veicoli,
            aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv)
            )
          `
        )

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliRitirati(data ?? []);

    };

    fetchData();
  }, []);

  async function StatusUpdate(uuidVeicolo, uuidStatoAvanzamento) {

    const payloadStatus = {
      uuid_veicolo_ritirato: uuidVeicolo,
      uuid_stato_avanzamento: uuidStatoAvanzamento,
    };

    const { data, error } = await supabase
      .from("log_avanzamento_demolizione")
      .insert(payloadStatus)
      .select()
      .single();

    if (error) {
      console.log("Errore statusUpdate:", error);
    } else {
      console.log("Stato aggiornato:", data);
    }

  }
  async function StatusDowngrade(uuidVeicolo, uuidStatoAvanzamento) {

    const { data, error } = await supabase
      .from("log_avanzamento_demolizione")
      .delete()
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .eq("uuid_stato_avanzamento", uuidStatoAvanzamento)

    if (error) {
      console.log("Errore statusUpdate:", error);
    } else {
      console.log("Stato aggiornato:", data);
    }

  }
  async function EliminaRitiro(uuidVeicolo, uuidLog) {
    if (!uuidVeicolo) return alert("seleziona un veicolo");
    if (!uuidLog) return alert("seleziona Log");

    // 1) Controllo: veicolo_consegnato deve essere false su dati_veicolo_ritirato
    const { data: veicoloRow, error: checkErr } = await supabase
      .from("dati_veicolo_ritirato")
      .select("uuid_veicolo_ritirato, veicolo_consegnato")
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .maybeSingle();

    if (checkErr) {
      console.error(checkErr);
      alert(`Errore verifica: ${checkErr.message}`);
      return;
    }

    if (!veicoloRow) {
      alert("Veicolo non trovato.");
      return;
    }

    if (veicoloRow.veicolo_consegnato !== false) {
      alert("Non puoi eliminare: il veicolo risulta consegnato.");
      return;
    }

    // 2) Update veicolo_ritirato -> false
    const { error: vrError } = await supabase
      .from("dati_veicolo_ritirato")
      .update({ veicolo_ritirato: false })
      .eq("uuid_veicolo_ritirato", uuidVeicolo);

    if (vrError) {
      console.error(vrError);
      alert(`Errore salvataggio: ${vrError.message}`);
      return;
    }

    // 3) Delete log SOLO se appartiene a quel veicolo (extra sicurezza)
    const { data: trasportoData, error: trasportoError } = await supabase
      .from("log_trasporto_veicolo")
      .delete()
      .eq("uuid_log_trasporto_veicolo", uuidLog)
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .select()
      .maybeSingle();

    if (trasportoError) {
      console.error(trasportoError);
      alert(`Errore eliminazione trasporto: ${trasportoError.message}`);
      return;
    }

    if (!trasportoData) {
      alert("Nessun log eliminato (log non trovato o non associato al veicolo).");
      return;
    }

    await StatusDowngrade(uuidVeicolo, "6adcebac-6465-452a-974d-912e1caab37b"); // IN TRANSITO

    setUpdateList((prev) => !prev);
    setStatusAziende((prev) => !prev);
    alert("Trasporto Eliminato");
  }

  return (
    <>
      <div className={`${onDisplay === true ? "" : "hidden"} w-full h-full`}>
        <div className="flex lg:flex-row flex-col flex-wrap lg:gap-y-3 gap-y-1 w-full min-h-0">
          {/* CRUSCOTTO */}
          {/* <div className="flex flex-row w-full gap-4 min-h-0 p-5 rounded-2xl bg-neutral-950">
            <div className="flex flex-row justify-between">
              <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                CRUSCOTTO
              </h4>
            </div>
          </div> */}
          {/* VEICOLI DA RITIRARE */}
          {/* <div className="flex flex-col gap-4 xl:basis-6/12 w-full p-1">
            <div className="flex flex-col border border-brand p-5 rounded-2xl h-full gap-2">
              <div className="flex flex-row justify-between">
                <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                  VEICOLI DA RITIRARE
                </h4>
              </div>
              <div className="flex flex-col gap-2 overflow-auto pe-2">
                {veicoliDaRitirare?.map((c, i) => (
                  <div key={c.uuid_veicolo_ritirato} className="flex flex-row justify-between border py-3 px-4 rounded-xl">
                    <div className="flex flex-wrap items-start gap-1">
                      <div className="flex flex-wrap gap-2">
                        <div className="w-36"><TargaDesign targa={c?.targa_veicolo_ritirato}/></div>
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaBuildingCircleArrowRight className="text-sky-700"/>{c?.aziendaRitiro?.ragione_sociale_arv}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaUser className="text-orange-500"/>{c?.nome_detentore} {c?.cognome_detentore}</div>
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaBarcode className="text-orange-500"/>{c?.cf_detentore}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 pe-5">
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaCar className="text-brand"/>{c?.modelloVeicolo.marca} {c?.modelloVeicolo.modello}</div>
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg uppercase"><FaCircleCheck className="text-brand"/>{c?.stato_gravami}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ButtonRitiraVeicolo
                        onClick={() =>
                          RitiroVeicolo(
                            c?.uuid_veicolo_ritirato,
                            formData?.camionRitiro,
                            formData?.autistaRitiro
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          {/* VEICOLI RITIRATI */}
          <div className="flex flex-col gap-2 xl:basis-12/12 w-full p-1 bg-neutral-950/50 rounded-xl">
            <div className="flex flex-col  p-5 rounded-2xl h-full gap-3">
              <div className="flex flex-row justify-between items-start">
                <h4 className="h-fit text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                  CRONOLOGIA VEICOLI RITIRATI
                </h4>
              </div>
              <div className="flex flex-col gap-2 overflow-auto pe-2">
                {veicoliRitirati?.length > 0 ? veicoliRitirati?.map((vr, i) => (
                  <div key={vr.uuid_log_trasporto_veicolo} className="flex flex-row justify-between border-b pb-2 border-brand/20">
                    <div className="flex flex-wrap items-center justify-start gap-1">
                      <span className="bg-white text-blue-900 font-bold text-xs rounded-md px-3">{vr?.veicoloRitirato?.targa_veicolo_ritirato}</span>
                      <span className="border text-xs rounded-md px-3 font-medium">{ vr?.veicoloRitirato?.aziendaRitiro?.ragione_sociale_arv}</span>
                      <span className=" bg-brand/30 text-xs rounded-md px-3">{vr?.autista?.nome_autista} {vr?.autista?.cognome_autista} / {vr?.camion?.targa_camion}</span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="border text-xs rounded-md px-3">{DataFormat(vr?.created_at_log_trasporto_veicolo)}</span>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ButtonRitiraVeicolo({ onClick }) {
  return (
    <>
      <button onClick={onClick}>
        <FaPlusSquare className="dark:text-white text-brand"/>
      </button>
    </>
  );
}

export function ButtonEliminaRitira({ onClick }) {
  return (
    <>
      <button onClick={onClick} className="text-red-500">
        <FaMinusSquare />
      </button>
    </>
  );
}