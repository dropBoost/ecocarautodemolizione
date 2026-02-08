'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"
import { Timeline,PickDotColor } from "@/app/componenti-sito/trackerStatus";
import { SpanElementList } from "@/app/componenti-sito/theme";
import { FaCaretRight, FaCarAlt, FaUser, FaBuilding, FaFileDownload } from "react-icons/fa";
import { DataFormat } from "@/app/componenti-sito/dataFormat";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function StatusDemolizione () {

    const params = useParams();

    const uuidVeicoloRitirato = params?.uuidVeicoloRitirato
    const [veicoloDemolito, setVeicoloDemolito] = useState([]) //DATI PRATICA
    const [veicoloRitirato, setVeicoloRitirato] = useState([]) //DATI VEICOLO
    const [statoAvanzamento, setStatoAvanzamento] = useState([]) //DATI AVANZAMENTO
    const datiVeicolo = veicoloRitirato ? veicoloRitirato[0] : []

    // CARICAMENTO DATI VEICOLO
    useEffect(() => {
  
      ;(async () => {
        const { data, error } = await supabase
          .from("dati_veicolo_ritirato")
          .select(`
            *,
            azienda_ritiro_veicoli:azienda_ritiro_veicoli (*),
            modello_veicolo:modello_veicolo (*)
          `)
          .eq("uuid_veicolo_ritirato", `${uuidVeicoloRitirato}`)

        if (error) {
          console.log(error)
          // toast.error("Errore nel caricamento certificati demolizione")
          return
        }
  
        // qui data è un ARRAY
        setVeicoloRitirato(data ?? [])
      })()
    }, [])

    // CARICAMENTO LOG AVANZAMENTO
    useEffect(() => {

    if (!datiVeicolo){
      console.log("status non caricato")
      return
    }

    ;(async () => {
        const { data, error } = await supabase
        .from("log_avanzamento_demolizione")
        .select(`*,
          stato:stati_avanzamento(alias_stato_avanzamento)`)
        .eq("uuid_veicolo_ritirato", `${datiVeicolo.uuid_veicolo_ritirato}`)
        .order("created_at_stato_avanzamento", { ascending: false })

        if (error) {
        console.log("AVANZAMENTO PRATICA:", { error })
        // toast.error("Errore nel caricamento certificati demolizione")
        return
        }
        setStatoAvanzamento(data ?? [])
    })()

    }, [veicoloRitirato])

    // CARICAMENTO DEMOLIZIONE
    useEffect(() => {

      if (datiVeicolo?.pratica_completata == false){
        return
      }
  
      ;(async () => {
        const { data, error } = await supabase
          .from("certificato_demolizione")
          .select(`*`)
          .eq("uuid_veicolo_ritirato", `${uuidVeicoloRitirato}`)

        if (error) {
          console.log(error)
          // toast.error("Errore nel caricamento certificati demolizione")
          return
        }
        // qui data è un ARRAY
        setVeicoloDemolito(data ?? {})
      })()
    }, [veicoloRitirato])

    return (
        <div className="flex flex-col items-center lg:justify-center justify-center bg-neutral-200 lg:px-5 lg:py-5 px-5 py-5 h-full">
          <div className="flex flex-col gap-5 bg-neutral-50 w-full max-w-[1100px] py-5 px-5 lg:mx-10 lg:my-10 m-0 rounded-2xl shadow-2xl h-fit overflow-auto">
            <div className="flex flex-col items-start p-5 text-sm justify-center w-full max-w-[1100px] h-fit border rounded-2xl dark:bg-companyPrimary">
              <h3 className="">STATUS DEMOLIZIONE: <font className="font-bold">{datiVeicolo?.targa_veicolo_ritirato}</font></h3>
            </div>
            <div className="flex flex-col items-center text-neutral-900 w-full">
              {veicoloRitirato.length > 0 ?
              <div className="flex flex-col items-center justify-center w-full max-w-[1100px] h-full">
                <div className="flex lg:flex-col flex-col justify-between w-full gap-7">
                  <div className="flex flex-col gap-3 bg-neutral-100 dark:bg-neutral-800 w-full rounded-xl p-5">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1" className="dark:border-neutral-600 dark:text-neutral-400">
                        <AccordionTrigger><span className="flex items-center justify-start gap-2"><FaCarAlt className="text-companyPrimary"/> DATI VEICOLO</span></AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1">
                            <SpanElementList icon={<FaCaretRight/>} label="Modello:" data={`${datiVeicolo?.modello_veicolo.marca} ${datiVeicolo?.modello_veicolo.modello}`}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Documento:" data={datiVeicolo?.tipologia_documento_veicolo_ritirato}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Anno Immatricolazione:" data={datiVeicolo?.anno_veicolo_ritirato}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Cilindrata:" data={datiVeicolo?.cilindrata_veicolo_ritirato}/>
                            <SpanElementList icon={<FaCaretRight/>} label="KM:" data={datiVeicolo?.km_veicolo_ritirato}/>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-2" className="dark:border-neutral-600 dark:text-neutral-400">
                        <AccordionTrigger><span className="flex items-center justify-start gap-2"><FaUser className="text-companyPrimary"/> DATI DETENTORE VEICOLO</span></AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1">
                            <SpanElementList icon={<FaCaretRight/>} label="Detentore Veicolo:" data={`${datiVeicolo?.nome_detentore} ${datiVeicolo?.cognome_detentore}`}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Tipologia Detentore:" data={datiVeicolo?.tipologia_detentore}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Nazionalità:" data={datiVeicolo?.nazionalita_documento_detentore}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Documento Detentore:" data={`${datiVeicolo?.tipologia_documento_detentore} n° ${datiVeicolo?.numero_documento_detentore}`}/>
                            <SpanElementList icon={<FaCaretRight/>} label="Indirizzo Detentore:" data={`${datiVeicolo?.indirizzo_detentore} - ${datiVeicolo?.cap_detentore} ${datiVeicolo?.citta_detentore} ${datiVeicolo?.provincia_detentore}`}/>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-3" className="border-none dark:text-neutral-400">
                        <AccordionTrigger><span className="flex items-center justify-start gap-2"><FaBuilding className="text-companyPrimary"/> DATI AZIENDA RITIRO</span></AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1">
                            <SpanElementList icon={<FaCaretRight/>} label="RITIRATO DA ECOCAR AUTODEMOLIZIONE"/>
                            <SpanElementList icon={<FaCaretRight/>} label="Data Ritiro Veicolo:" data={DataFormat(datiVeicolo?.created_at_veicolo_ritirato)}/>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="w-full bg-neutral-300 rounded-xl px-7 py-7">
                  {veicoloDemolito.length == 0 ?
                    <>
                      <div className="border rounded-xl p-3 bg-companyPrimary text-neutral-300 mb-5">
                        <h3 className="text-xs">STATO AVANZAMENTO DEMOLIZIONE</h3>
                      </div>
                      <Timeline
                        items={(statoAvanzamento ?? []).map(t => ({
                          id: t.uuid_log_avanzamento_demolizione,
                          title: t?.stato?.alias_stato_avanzamento || "Stato",
                          datetime: t.created_at_stato_avanzamento,
                          description: t.note_log_stato_avanzamento,
                          dotClassName: PickDotColor(t?.stato?.alias_stato_avanzamento || "")
                        }))}
                        className="ml-2"
                      />
                    </> : 
                    <div className="flex flex-col gap-5">
                      <span className="text-xs">SCARICA IL CERTIFICATO DI DEMOLIZIONE</span>
                      <div className="flex flex-row gap-3">
                        <a href={`${veicoloDemolito[0]?.documento_demolizione}`}>
                          <button className="flex flex-row items-center gap-1 rounded-xl px-4 py-1 bg-neutral-100 hover:bg-companyPrimary hover:text-neutral-100 text-sm font-bold text-companyPrimary"><FaFileDownload/>CERTIFICATO</button>
                        </a>
                        <a href={`${veicoloDemolito[0]?.altro_documento_demolizione}`}>
                          <button className="flex flex-row items-center gap-1 rounded-xl px-4 py-1 bg-neutral-100 hover:bg-companyPrimary hover:text-neutral-100 text-sm font-bold text-companyPrimary"><FaFileDownload/>ALTRO DOCUMENTO</button>
                        </a>
                      </div>
                    </div>
                  }
                  </div>
                </div>
              </div> : "...attendi" }
            </div>
          </div>
        </div>
    )
}


