'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner" // o da dove lo importi
import TargaDesign from "@/app/componenti/targaDesign"
import { TbBuildingSkyscraper } from "react-icons/tb";
import Link from "next/link"

export default function PAGEveicoliAttesaRitiro({ onDisplay, statusAziende, setStatusAziende }) {

  const [veicoliAttesa, setVeicoliAttesa] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function veicoliAttesaList() {
      setLoading(true)

      const { data, error } = await supabase
        .from('dati_veicolo_ritirato')
        .select(`
          uuid_veicolo_ritirato,
          uuid_azienda_ritiro_veicoli,
          targa_veicolo_ritirato,
          created_at_veicolo_ritirato,
          demolizione_approvata,
          veicolo_ritirato,
          aziendaRitiro:azienda_ritiro_veicoli(
          uuid_azienda_ritiro_veicoli,
          ragione_sociale_arv
          )`)
        .eq('veicolo_ritirato', false)
        .eq('demolizione_approvata', true)
        .order('created_at_veicolo_ritirato', { ascending: false })

      if (error) {
        console.error(error)
        toast.error('Errore nel caricamento dei veicoli da ritirare')
        if (mounted) setLoading(false)
        return
      }

      if (mounted) {
        setVeicoliAttesa(data ?? [])
        setLoading(false)
      }
    }

    veicoliAttesaList()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className={`${onDisplay ? "" : "hidden"} w-full flex-1 min-h-0 flex flex-col md:p-0 md:pe-3 px-4`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row rounded-xl gap-3">
          <div className="flex flex-col w-full border p-5 rounded-xl gap-2">
            <span className="border border-brand px-2 py-1 text-xs rounded-lg w-fit">PRATICHE IN ATTESA DI RITIRO</span>
            <div className="">
              <span className="text-9xl text-brand">{veicoliAttesa.length}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap border rounded-xl p-5 gap-2 overflow-auto">
          {veicoliAttesa?.length ? 
          veicoliAttesa.map(v => (
          <Link key={v.targa_veicolo_ritirato} href={`/gestionale/ritiri-demolizioni/${v.uuid_azienda_ritiro_veicoli}/${v.uuid_veicolo_ritirato}`}>
            <div className="flex flex-col border rounded-xl px-5 py-3 hover:border-brand hover:shadow-xl">
              <div className="w-36">
                <TargaDesign targa={v.targa_veicolo_ritirato}/>
              </div>
              <span className="text-xs flex flex-row items-center gap-1"><TbBuildingSkyscraper className="text-brand"/>{v.aziendaRitiro.ragione_sociale_arv}</span>
            </div>
          </Link>
          )) : null }
        </div>

      </div>
    </div>
  )
}
