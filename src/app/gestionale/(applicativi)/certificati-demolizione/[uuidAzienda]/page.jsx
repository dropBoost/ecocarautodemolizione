'use client'

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DisplayCertificatiDemolizioniAzienda from "../componenti/displayElencoCertificatiDemolizioniAzienda";

  export default function PraticheAzienda() {

    const params = useParams();
    const uuidAzienda = params?.uuidAzienda;
    const [listPraticheAzienda, setListPraticheAzienda] = useState([])  
    const [datiAzienda, setDatiAzienda] = useState([])  
    const [certificatiDemolizione, setCertificatiDemolizione] = useState([])

    // ricerca
    const [dataSearch, setDataSearch] = useState("")        // testo digitato
    const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato


    const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

    // CARICAMENTO DATI AZIENDA
    useEffect(() => {
        if (!params.uuidAzienda){
        return
        }
        ;(async () => {
        const { data: aziendaData, error } = await supabase
            .from("azienda_ritiro_veicoli")
            .select('uuid_azienda_ritiro_veicoli,ragione_sociale_arv, piva_arv')
            .eq("uuid_azienda_ritiro_veicoli", uuidAzienda)

        if (error) {
            console.error(error)
            toast.error("Errore nel caricamento Dati Azienda")
            return
        }
        setDatiAzienda(aziendaData ?? [])
        })()
    }, [uuidAzienda])   

    //CERTIFICATI DEMOLIZIONE
		useEffect(() => {
			if (!uuidAzienda) return;

			(async () => {
				let query = supabase
					.from("certificato_demolizione")
					.select(
						`
						*,
						dati_veicolo_ritirato!inner(
							uuid_veicolo_ritirato,
							targa_veicolo_ritirato,
							vin_veicolo_ritirato,
							mobile_detentore,
							email_detentore,
							created_at_veicolo_ritirato,
							pratica_completata,
							uuid_azienda_ritiro_veicoli,
							azienda_ritiro_veicoli(
								uuid_azienda_ritiro_veicoli,
								ragione_sociale_arv,
								piva_arv,
								citta_operativa_arv,
								provincia_operativa_arv,
								attiva_arv
							)
						)
					`,
						{ count: "exact" }
					)
					.eq("dati_veicolo_ritirato.uuid_azienda_ritiro_veicoli", uuidAzienda)
					.order("created_at_certificato_demolizione", { ascending: false })

				if (dataSearchSubmit) {
					const q = escapeLike(dataSearchSubmit).replaceAll(",", " ");

					// ✅ un solo OR, con prefisso per i campi della tabella inner
					query = query.ilike("dati_veicolo_ritirato.targa_veicolo_ritirato", `%${q}%`)
				}

				const { data, error, count } = await query;

				if (error) {
					console.error("ERRORE (message):", error.message);
					console.error("ERRORE (details):", error.details);
					console.error("ERRORE (hint):", error.hint);
					console.error("ERRORE (code):", error.code);
					return;
				}

				setCertificatiDemolizione(data ?? []);
			})();
		}, [uuidAzienda, dataSearchSubmit]);

    // handlers ricerca
    function handleChangeSearchBar(e) {
        setDataSearch(e.target.value)
    }
    function handleSearchClick() {
        setDataSearchSubmit(dataSearch.trim())
    }
    function handleSearchKeyDown(e) {
        if (e.key === "Enter") {
        setDataSearchSubmit(dataSearch.trim())
        }
    }
    function handleReset() {
        setDataSearch("")
        setDataSearchSubmit("")
    }

  return (
  <>
      <div className={`${listPraticheAzienda ? '' : 'hidden'} w-full min-h-0 flex-1 flex flex-col gap-4`}>
      <div className="col-span-12">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">{datiAzienda[0]?.ragione_sociale_arv} / {datiAzienda[0]?.piva_arv}</h4>
      </div>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca nome, cognome, email o telefono…"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>


      <div className="flex flex-col gap-3">
        {certificatiDemolizione?.length ? certificatiDemolizione?.map((cd, index) => {
          
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
            <DisplayCertificatiDemolizioniAzienda
            key={cd?.uuid_veicolo_ritirato} uuid={cd?.uuid_veicolo_ritirato} data={DataFormat(cd?.created_at_certificato_demolizione)}
            targa={cd?.dati_veicolo_ritirato.targa_veicolo_ritirato} telaio={cd?.dati_veicolo_ritirato.vin_veicolo_ritirato}
            docDemolizione={cd?.documento_demolizione} altroDocDemolizione={cd?.altro_documento_demolizione} tipologiaDemolizione={cd?.tipologia_demolizione}
            note={cd?.note_demolizione} mobile={cd?.dati_veicolo_ritirato.mobile_detentore} email={cd?.dati_veicolo_ritirato.email_detentore}
            uuidAzienda={uuidAzienda} uuidCD={cd?.uuid_certificato_demolizione}
            
            completata={cd?.pratica_completata} 
            tipologiaD={cd?.forma_legale_detentore} ragioneSociale={cd?.ragione_sociale_detentore} nome={cd?.nome_detentore} cognome={cd?.cognome_detentore} piva={cd?.piva_detentore}
            cf={cd?.cf_detentore} modelloVeicolo={``} documento={cd?.tipologia_documento_veicolo_ritirato}
            
            />
          );
          
        }) : (
            <span colSpan={8} className="h-24 text-center">Nessun certificato presente.</span>
        )}
      </div> 
    </div>
  </>
  )
}