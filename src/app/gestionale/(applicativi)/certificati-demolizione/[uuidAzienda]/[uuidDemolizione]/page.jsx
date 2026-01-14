'use client'

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"
import CertificatoDemolizione from "./displayCertificatoDemolizione";

  export default function PraticheAzienda() {

    const params = useParams();
    const uuidDemolizione = params?.uuidDemolizione;
    const [certificatoDemolizione, setCertificatoDemolizione] = useState([])
    const [refreshKey, setRefreshKey] = useState(0);

    //CERTIFICATO DEMOLIZIONE
    useEffect(() => {

    if (!uuidDemolizione) return;

      (async () => {
        const { data, error } = await supabase
          .from("certificato_demolizione")
          .select(`
            *,
            dati_veicolo_ritirato!inner(*,
              azienda_ritiro_veicoli(*),
              modello_veicolo(marca,modello)
            )
          `)
          .eq("uuid_certificato_demolizione", uuidDemolizione)

        if (error) {
          console.error("ERRORE CARICAMENTO CERTIFICATO DEMOLIZIONE:", error)
          return
        }

        setCertificatoDemolizione(data ?? {})
      })()
    }, [uuidDemolizione, refreshKey])

  return (
  <>
      <div className={`${uuidDemolizione ? '' : 'hidden'} w-full min-h-0 flex-1 flex flex-col gap-4`}>
      <div className="col-span-12">
        <h4 className="text-xs font-bold text-dark dark:text-neutral-400 border border-brand px-3 py-2 w-fit rounded-xl">PRATICA DEMOLIZIONE: {uuidDemolizione}</h4>
      </div>

      <div className="flex flex-col gap-3">
        {certificatoDemolizione?.map((cd, index) => {
          
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

          return (
            <CertificatoDemolizione
            key={cd?.uuid_veicolo_ritirato} uuid={cd?.uuid_veicolo_ritirato} data={DataFormat(cd?.created_at_certificato_demolizione)}
            targa={cd?.dati_veicolo_ritirato.targa_veicolo_ritirato} telaio={cd?.dati_veicolo_ritirato.vin_veicolo_ritirato}
            docDemolizione={cd?.documento_demolizione} altroDocDemolizione={cd?.altro_documento_demolizione} tipologiaDemolizione={cd?.tipologia_demolizione}
            note={cd?.note_demolizione} mobile={cd?.dati_veicolo_ritirato.mobile_detentore} email={cd?.dati_veicolo_ritirato.email_detentore}
            datiV={certificatoDemolizione[0].dati_veicolo_ritirato} uuidDemolizione={uuidDemolizione} setRefreshKey={setRefreshKey} refreshKey={refreshKey}

            completata={cd?.pratica_completata} 
            tipologiaD={cd?.forma_legale_detentore} ragioneSociale={cd?.ragione_sociale_detentore} nome={cd?.nome_detentore} cognome={cd?.cognome_detentore} piva={cd?.piva_detentore}
            cf={cd?.cf_detentore} modelloVeicolo={``} documento={cd?.tipologia_documento_veicolo_ritirato}
            
            />
          );
          
        })}
      </div> 
    </div>
  </>
  )
}