'use client'

import { useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient"
import { FaCircle, FaDotCircle } from "react-icons/fa";
import Link from "next/link";
import StatusTracking from "../../componenti/statusTracking";
import ReadTracking from "../../componenti/readTracking";
import BTNapprovazionePratica from "@/app/gestionale/(applicativi)/ritiri-demolizioni/[uuidAzienda]/[uuidRitiroVeicolo]/componenti/bottoneApprovazionePratica";
import { useAdmin } from "@/app/admin/components/AdminContext";

  export default function SchedaVeicoli() {

    const utente = useAdmin()
    const role = utente?.utente?.user_metadata?.ruolo
    const params = useParams();
    const uuidRitiroVeicolo = params?.uuidRitiroVeicolo;
    const [praticaAuto, setPraticaAuto] = useState([])  
    const [datiDemolizione, setDatiDemolizione] = useState([])
    const [updateTracking, setUpdateTracking] = useState(false)
    const [sUpdateComponent,setSUpdateComponent] = useState(false)

    // CARICAMENTO PRATICA VEICOLO
    useEffect(() => {
        if (!params.uuidRitiroVeicolo){
        return
        }
        ;(async () => {
        const { data: praticheData, error } = await supabase
            .from("dati_veicolo_ritirato")
            .select(`
              *,
              modello:modello_veicolo (
                uuid_modello_veicolo,
                marca,
                modello
              ),
              azienda:azienda_ritiro_veicoli (
                uuid_azienda_ritiro_veicoli,
                ragione_sociale_arv,
                piva_arv
              )
            `)
            .eq("uuid_veicolo_ritirato", uuidRitiroVeicolo)
            .order("created_at_veicolo_ritirato", {ascending: false})

        if (error) {
            console.error(error)
            toast.error("Errore nel caricamento Modelli Marchio Auto")
            return
        }
        setPraticaAuto(praticheData ?? [])
        })()
    }, [uuidRitiroVeicolo, sUpdateComponent])  

    // CARICAMENTO DEMOLIZIONI
    useEffect(() => {
    if (!uuidRitiroVeicolo) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("certificato_demolizione")
        .select(`*,
          datiVeicolo:dati_veicolo_ritirato(
          targa_veicolo_ritirato)`)
        .eq("uuid_veicolo_ritirato", uuidRitiroVeicolo)
        .maybeSingle(); // o .single() se sei certo che esista

      if (cancelled) return;

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento certificato di demolizione");
        return;
      }

      setDatiDemolizione(data ? [data] : []); // mantieni lo state come array se ti torna comodo
    })();

      return () => { cancelled = true; };
    }, [uuidRitiroVeicolo, sUpdateComponent]);

  return (
  <>
    <div className={`${praticaAuto[0] ? '' : 'hidden'} w-full h-full flex flex-1 flex-col gap-4 p-3`}>
      {/* AZIENDA RITIRO */}
      <div className="">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-neutral-400 border border-neutral-400 px-3 py-2 w-fit rounded-xl">{praticaAuto[0]?.azienda.ragione_sociale_arv} / {praticaAuto[0]?.azienda.piva_arv}</h4>
      </div>
			{/* APPROVAZIONE O RIFIUTO PRATICA */}
      <div className="flex flex-row justify-between border border-brand p-3 w-full rounded-xl items-center text-xs">
				<div className="flex lg:flex-row flex-col lg:gap-1">
						<span>STATO ATTUALE:</span>
						<span className="">
						{" "}
						{(() => {
							if (praticaAuto[0]?.demolizione_approvata == null) return "in attesa"
							if (praticaAuto[0]?.demolizione_approvata === true) return "approvata"
							return "rifiutata"
						})()}
					</span>
				</div>
        <BTNapprovazionePratica uuidPratica={uuidRitiroVeicolo} sUpdateComponent={sUpdateComponent} setSUpdateComponent={setSUpdateComponent}/>
      </div>
      {/* DATI */}
      <div className="flex flex-col w-full justify-between border border-brand rounded-xl p-5">
        <div id="maincontainergrid" className="flex lg:flex-row flex-col">
            {praticaAuto.length ? praticaAuto.map((pa, index) => {
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
                <div id="rowContainer" className="flex flex-col gap-2 items-start" key={`${pa.targa_veicolo_ritirato ?? index}`}>
                    {pa.pratica_completata ?
                      <div className="flex flex-row items-center gap-2 border border-neutral-800 px-3 py-2 rounded-xl h-fit text-xs">
                        <FaCircle className="text-brand"/>
                        <span>STATO: COMPLETATO</span>
                      </div> : 
                      <div className="flex flex-row items-center gap-2 border border-neutral-800 px-3 py-2 rounded-xl h-fit text-xs">
                        <FaDotCircle className="text-red-700"/>
                        <span>STATO: IN CORSO</span>
                      </div>
                    }
                    <div id="containerOne" className="flex lg:flex-row flex-col gap-1 items-start h-fit">
                        <div className="flex flex-row gap-1">
                          <span className="uppercase font-bold">{pa.nome_detentore}</span> <span className="uppercase font-bold">{pa.cognome_detentore}</span>
                        </div>
                        <div className="flex flex-row gap-2">
                          <span>{pa.indirizzo_detentore} - {pa.cap_detentore} {pa.citta_detentore} - {pa.provincia_detentore}</span>
                        </div>
                    </div>
                    <div id="containerTwo" className="flex flex-row items-start h-fit gap-2 text-sm">
                      <div className="flex flex-row gap-2 border border-brand rounded-lg px-2">
                        {pa.forma_legale_detentore == "azienda" ? <span> {pa.ragione_sociale_detentore} / P.IVA: {pa.piva_detentore}</span> : <span>Codice Fiscale {pa.cf_detentore} </span>}
                      </div>
                    </div>
                    <div id="containerThree" className="flex lg:flex-row flex-col items-start h-fit gap-2 text-sm">
                      <div className="flex flex-row gap-2 bg-brand text-neutral-950 rounded-lg px-2">
                        <span className="font-bold">{pa.targa_veicolo_ritirato}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        <span className="uppercase font-semibold text-brand">{pa.modello.marca} {pa.modello.modello}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        CM³ {pa.cilindrata_veicolo_ritirato}
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        {pa.anno_veicolo_ritirato}
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        KM {pa.km_veicolo_ritirato}
                      </div>
                    </div>
                    <div id="containerFour" className="flex flex-row items-start h-fit gap-2 text-sm">
                      <div className="flex flex-row gap-2 bg-neutral-200 text-neutral-950 rounded-lg px-2">
                        <span className="font-bold">{pa.vin_veicolo_ritirato}</span>
                      </div>
                    </div>
                    <div id="containerFive" className="flex lg:flex-row flex-col items-start h-fit gap-2 text-sm">
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Documento Veicolo: <span className="uppercase font-semibold text-brand">{pa.tipologia_documento_veicolo_ritirato}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Documento Detentore: <span className="uppercase font-semibold text-brand">{pa.tipologia_documento_detentore} - {pa.numero_documento_detentore}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Tipologia Detentore: <span className="uppercase font-semibold text-brand">{pa.tipologia_detentore}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Nazionalità: <span className="uppercase font-semibold text-brand">{pa.nazionalita_documento_detentore}</span>
                      </div>
                    </div>
                    <div id="containerSix" className="flex lg:flex-row flex-col items-start h-fit gap-2 text-sm">
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Email: <span className="font-semibold text-brand">{pa.email_detentore}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Mobile: <span className="uppercase font-semibold text-brand">{pa.mobile_detentore}</span>
                      </div>
                      <div className="flex flex-row gap-2 border rounded-lg px-2">
                        Tipologia Detentore: <span className="uppercase font-semibold text-brand">{pa.tipologia_detentore}</span>
                      </div>
                    </div>
                </div>
              )
            }) : (
              <div className="h-24 text-center">Nessun dato disponibile</div>
            )}
        </div>
      </div>
      {/* DOCUMENTI */}
      <div className="">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">DOCUMENTI</h4>
      </div>
      <div className="w-full border rounded-xl p-4">
        <div id="mainImagecontainergridtwo" className="flex flex-row">
            {praticaAuto?.length ? praticaAuto.map((pa, index) => {
              return (
                <div id="rowImageContainer" className="flex flex-wrap w-full" key={`${pa.uuid_veicolo_ritirato ?? index}`}>
									{pa.foto_documento_detentore_f ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_documento_detentore_f} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover object-center rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_documento_detentore_f}?download=${pa.targa_veicolo_ritirato}-doc-detentore-fronte.jpg`} target="_blank">
													DETENTORE FRONTE
												</Link>
											</button>
										</div>
									</div> : null
									}
									{pa.foto_documento_detentore_r ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_documento_detentore_r} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_documento_detentore_r}?download=${pa.targa_veicolo_ritirato}-doc-detentore-retro.jpg`} target="_blank">
													DETENTORE RETRO
												</Link>
											</button>
										</div>
									</div> : null
									}
									{pa.foto_documento_veicolo_ritirato_f ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_documento_veicolo_ritirato_f} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_documento_veicolo_ritirato_f}?download=${pa.targa_veicolo_ritirato}-doc-veicolo-fronte.jpg`} target="_blank">
													VEICOLO FRONTE
												</Link>
											</button>
										</div>
									</div> : null
									}  
									{pa.foto_documento_veicolo_ritirato_r ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_documento_veicolo_ritirato_r} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover object-center rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_documento_veicolo_ritirato_r}?download=${pa.targa_veicolo_ritirato}-doc-veicolo-retro.jpg`} target="_blank">
													VEICOLO RETRO
												</Link>
											</button>
										</div>
									</div> : null
									}
									{pa.foto_complementare_veicolo_ritirato_f ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_complementare_veicolo_ritirato_f} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover object-center rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_complementare_veicolo_ritirato_f}?download=${pa.targa_veicolo_ritirato}-complementare-veicolo-fronte.jpg`} target="_blank">
													COMPLEMENTARE FRONTE
												</Link>
											</button>
										</div>
									</div> : null
									}
									{pa.foto_complementare_veicolo_ritirato_r ? 
									<div className="xl:basis-2/12 basis-6/12 p-1 flex flex-row items-start h-fit gap-2 text-sm">
										<div className="flex flex-col gap-1 w-full">
											<div className="relative w-full h-[200px] overflow-hidden rounded">
											<Image src={pa.foto_complementare_veicolo_ritirato_r} fill alt={`${pa.uuid_veicolo_ritirato}`} className="object-cover object-center rounded"/>
											</div>
											<button className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg text-xs">
												<Link href={`${pa.foto_complementare_veicolo_ritirato_r}?download=${pa.targa_veicolo_ritirato}-complementare-veicolo-retro.jpg`} target="_blank">
													COMPLEMENTARE RETRO
												</Link>
											</button>
										</div>
									</div> : null
									}
                </div>
              )
            }) : (
              <div className="h-24 text-center">Nessun documento disponibile...</div>
            )}
        </div>
      </div>
      {/* DEMOLIZIONE */}
      <div className="">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">DEMOLIZIONE</h4>
      </div>
      <div className="w-full border rounded-xl p-5">
        <div id="mainImagecontainergridtwo" className="flex flex-row">
          {datiDemolizione.length ? datiDemolizione.map((dem, index) => {
            return (
              <>
              <div id="rowImageContainer" className="grid grid-cols-4 w-full gap-2" key={`${dem.uuid_veicolo_ritirato ?? index}`}>
                {dem.documento_demolizione ? 
                <div className="lg:col-span-1 col-start-1 col-span-2 flex flex-row items-start h-fit gap-2 text-sm">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="relative w-full h-[200px] overflow-hidden rounded">
                    <Image src="/pdf_placeholder.webp" fill alt={`${dem.uuid_veicolo_ritirato}`} className="object-cover object-center rounded"/>
                    </div>
                    <Link href={`${dem.documento_demolizione}?download=${dem.datiVeicolo.targa_veicolo_ritirato}-${dem.tipologia_demolizione}-demolizione.jpg`} target="_blank">
                      <button asChild className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg">
                      DOCUMENTO DEMOLIZIONE
                      </button>
                    </Link>
                  </div>
                </div> : null
                }
                {dem.altro_documento_demolizione !== "" ? 
                <div className="lg:col-span-1 col-start-3 col-span-2 flex flex-row items-start h-fit gap-2 text-sm">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="relative w-full h-[200px] overflow-hidden rounded">
                    <Image src={dem.altro_documento_demolizione} fill alt={`${dem.uuid_veicolo_ritirato}`} className="object-cover rounded"/>
                    </div>
                    <button asChild className="uppercase font-bold bg-brand py-2 px-1 rounded-b-lg">
                      <Link href={`${dem.altro_documento_demolizione}?download=${dem.datiVeicolo.targa_veicolo_ritirato}-${dem.tipologia_demolizione}-altro.jpg`} target="_blank">
                        ALTRO DOCUMENTO
                      </Link>
                    </button>
                  </div>
                </div> : null
                }
              </div>
              </>
            )
          }) : (
            <div className="h-fit text-center">NESSUNA DEMOLIZIONE INSERITA</div>
          )}
        </div>
      </div>
      {/* STATUS PRATICA */}
      <div className="flex flex-row gap-2">
        <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">TRACKING</h4>
        <StatusTracking uuidRitiroVeicolo={uuidRitiroVeicolo} setUpdateTracking={setUpdateTracking}/>
      </div>
      <div className='p-6 rounded-2xl shadow-lg min-w-0 min-h-0 bg-white dark:bg-neutral-900 border'>
        <ReadTracking uuidRitiroVeicolo={uuidRitiroVeicolo} updateTracking={updateTracking}/>
      </div>
    </div>
  </>
  )
}


