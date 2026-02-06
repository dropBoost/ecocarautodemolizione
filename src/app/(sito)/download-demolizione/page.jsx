'use client'

import { FormField } from "@/app/componenti-sito/formComponents"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { FaFileDownload } from "react-icons/fa";

export default function Download () {

  const [loading, setLoading] = useState(false)
  const [targa, setTarga] = useState("")
  const [codiceFiscale, setCodiceFiscale] = useState("")
  const [veicoloRitirato, setVeicoloRitirato] = useState({})
  const [statoRicerca, setStatoRicerca] = useState("...compila i campi")

  function handleChange(e) {
    const { name, value } = e.target
    if (name == "targa") {
      setTarga(value.toUpperCase().trim().slice(0, 7))
    } else {
      setCodiceFiscale(value.toUpperCase().trim().slice(0, 16))
    }
  }

  // CARICAMENTO DEMOLIZIONI
  useEffect(() => {
    // se la targa non è completa, non fare query
    if (!targa) return

    ;(async () => {
      const { data, error } = await supabase
        .from("dati_veicolo_ritirato")
        .select(`*`)
        .eq("targa_veicolo_ritirato", `${targa}`)
        .eq("cf_detentore", `${codiceFiscale}`)

      if (error) {
        console.error(error)
        // toast.error("Errore nel caricamento certificati demolizione")
        return
      }

      // qui data è un ARRAY
      setVeicoloRitirato(data ?? [], setStatoRicerca("targa non trovata o codice fiscale errato"))
    })()
  }, [targa, codiceFiscale])

    return(
        <>
        {/* CONTENUTO PAGINA */}
        <div id="pageContenent" className="w-full h-full flex lg:flex-row flex-col bg-neutral-200">
          <div id="col-sx" className="lg:w-96 lg:h-full h-48 w-full lg:order-1 order-2">
            <img src={`/download-demolizione.jpg`} alt="test" className="w-full h-full object-cover"/>
          </div>
          <div id="col-dx" className="flex flex-col w-full flex-1 items-center justify-center gap-2 h-full border-3 border-red-900 lg:p-0 p-24 order-1 lg:order-2">
            <div className="flex flex-col items-center justify-center rounded-2xl shadow-xl ">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="bg-companyPrimary rounded-full text-2xl p-4 mb-2 text-neutral-100 "><FaFileDownload/></span>
                <h6 className="font-semibold uppercase text-companyPrimary">SCARICA LA TUA DEMOLIZIONE</h6>
                <p className="text-xs text-neutral-600">Compila il modulo ed ottieni il certificato di demolizione della tua auto</p>
              </div>
              <form className="flex flex-col gap-3 border border-neutral-200 p-5 rounded-xl w-96">
                  <FormField nome="codiceFiscale" label='Codice Fiscale' value={codiceFiscale} onchange={handleChange} type='text' colorLabel={`text-companyPrimary`}/>
                  <FormField nome="targa" label='Targa' value={targa} onchange={handleChange} type='text' colorLabel={`text-companyPrimary`}/>
                  {veicoloRitirato.length > 0 ?
                  <div className="flex justify-end items-center mt-2">
                    <Link href={`/download-demolizione/${veicoloRitirato[0]?.uuid_veicolo_ritirato}`}>
                        <button className="flex flex-row items-center justify-center gap-2 border border-companyPrimary hover:bg-companyPrimary text-neutral-800 hover:text-neutral-200 px-5 py-1 text-xs rounded-xl font-semibold transition disabled:opacity-60 lg:w-fit w-full h-8">
                            <FaFileDownload/> SCARICA
                        </button>
                    </Link>
                  </div> : <span className="text-xs text-end text-xs text-neutral-600">{statoRicerca}</span> }
              </form>
            </div>
          </div>
        </div>
        {/* FINE PAGINA */}
        </>
    )
}