'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DisplayCercaTargaVeicoli from "./componenti/displayCercaTargaVeicoli";
import { toast } from "sonner";

  export default function CercaTarga({ onDisplay }) {

    const params = useParams();
    const uuidAzienda = params?.uuidAzienda;
    const [listPraticheAzienda, setListPraticheAzienda] = useState([])  
    const [datiAzienda, setDatiAzienda] = useState([])
    const [updateList, setUpdateList] = useState(true)

    // ricerca
    const [dataSearch, setDataSearch] = useState("")        // testo digitato
    const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato

  // CARICAMENTO PRATICHE AZIENDA
  useEffect(() => {

  async function fetchData() {
    const { data, error } = await supabase
      .from("dati_veicolo_ritirato")
      .select(`
        *,
        modello:modello_veicolo(
          marca,
          modello
        )
      `)
      .eq("targa_veicolo_ritirato", dataSearchSubmit)

    if (error) {
      console.error(error);
      return;
    }

    setListPraticheAzienda(data)
  }

  fetchData();

  }, [dataSearchSubmit]);

  // useEffect(() => {

  //   if (listPraticheAzienda?.length == 0) {
  //     return
  //   } 
  //   toast.info(`pratiche auto ${datiAzienda[0]?.ragione_sociale_arv} caricate con successo`)
    
  // },[datiAzienda])


  // handlers ricerca
  function handleChangeSearchBar(e) {
      setDataSearch(e.target.value)
  }
  function handleSearchClick() {
    setDataSearchSubmit(dataSearch.trim().toUpperCase());
    {dataSearch.length > 0 ? toast.info(`ricerca targa ${dataSearch}`) : null}
  }
  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      setDataSearchSubmit(dataSearch.trim().toUpperCase());
      {dataSearch.length > 0 ? toast.info(`ricerca targa ${dataSearch}`) : null}
    }
  }
  function handleReset() {
      setDataSearch("")
      setDataSearchSubmit("")
  }

  return (
  <>
    <div className={`${onDisplay ? "" : "hidden"} w-full flex flex-col gap-3 px-4`}>
      <div className={`${listPraticheAzienda ? '' : 'hidden'} w-full min-h-0 flex-1 flex flex-col gap-4`}>
      <div className="col-span-12">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">{datiAzienda[0]?.ragione_sociale_arv} / {datiAzienda[0]?.piva_arv}</h4>
      </div>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca targa…"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand placeholder:text-xs
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>

      <div className="flex flex-col gap-3">
        {listPraticheAzienda?.length ? listPraticheAzienda?.map((lpa, index) => {
          
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
            <DisplayCercaTargaVeicoli
            key={lpa?.uuid_veicolo_ritirato}
            uuid={lpa?.uuid_veicolo_ritirato}
            uuidAzienda={lpa?.uuid_azienda_ritiro_veicoli}
            data={DataFormat(lpa?.created_at_veicolo_ritirato)}

            modelloVeicolo={`${lpa?.modello.marca} ${lpa?.modello.modello}`}
            documento={lpa?.tipologia_documento_veicolo_ritirato}
            targa={lpa?.targa_veicolo_ritirato}
            telaio={lpa?.vin_veicolo_ritirato}
            vinLeggibile={lpa?.vin_leggibile}
            gravami={lpa?.stato_gravami}

            formaLegale={lpa?.forma_legale_detentore}
            tipologiaD={lpa?.tipologia_detentore}
            ragioneSociale={lpa?.ragione_sociale_detentore}
            nome={lpa?.nome_detentore}
            cognome={lpa?.cognome_detentore}
            piva={lpa?.piva_detentore}
            cf={lpa?.cf_detentore}
            documentoDetentore={lpa?.tipologia_documento_detentore}
            nDocDetentore={lpa?.numero_documento_detentore}
            mobileDetentore={lpa?.mobile_detentore}
            email={lpa?.email_detentore}
            indirizzo={`${lpa?.indirizzo_detentore} - ${lpa?.cap_detentore} ${lpa?.citta_detentore} (${lpa?.provincia_detentore})`}

            completata={lpa?.pratica_completata}
            veicoloConsegnato={lpa?.veicolo_consegnato}
            veicoloRitirato={lpa?.veicolo_ritirato}
            demolizioneApprovata={lpa?.demolizione_approvata}

            iDocVeicoloF={lpa?.foto_documento_veicolo_ritirato_f}
            iDocVeicoloR={lpa?.foto_documento_veicolo_ritirato_r}
            iDocDetentoreF={lpa?.foto_documento_detentore_f}
            iDocDetentoreR={lpa?.foto_documento_detentore_r}
            iComplementareF={lpa?.foto_complementare_veicolo_ritirato_f}
            iComplementareR={lpa?.foto_complementare_veicolo_ritirato_r}

            setUpdateList={setUpdateList}
            />
          );
          
        }) : (
            <span colSpan={8} className="h-24 text-center">Nessun veicolo ritirato.</span>
        )}
      </div> 
      </div>
    </div>
  </>
  )
}