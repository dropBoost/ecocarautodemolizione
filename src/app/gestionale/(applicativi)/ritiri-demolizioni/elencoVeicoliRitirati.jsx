'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import DisplayAziendeRitiriDemolizioni from "./componenti/displayAziendeRitiriDemolizioni";
import { useAdmin } from "@/app/admin/components/AdminContext";

export default function ElencoVeicoliRitirati({ onDisplay, statusAziende, setStatusAziende }) {

  const utente = useAdmin()
  const role = utente?.utente?.user_metadata?.ruolo
  const uuidUtente = utente?.utente?.id
  const [aziendaRitiroVeicoli, setAziendaRitiroVeicoli] = useState([])
  const [datiVeicoloRitirato, setDatiVeicoloRitirato] = useState([])
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato
  const isAdmin = role === "admin" || role === "superadmin"
  const isTrasporter = role === "transporter"
  const isCompany = role === "company"
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

  function handleChangeSearchBar(e) {
    setDataSearch(e.target.value)
  }
  function handleSearchClick() {
    setDataSearchSubmit(dataSearch.trim())
    setPage(1)
  }
  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      setDataSearchSubmit(dataSearch.trim())
      setPage(1)
    }
  }
  function handleReset() {
    setDataSearch("")
    setDataSearchSubmit("")
    setPage(1)
  }

  useEffect(() => {

    if (!role) return
    if ((!isAdmin || isCompany) && !uuidUtente) return

    const fetchData = async () => {
      let query = supabase
        .from("azienda_ritiro_veicoli")
        .select(
          `
            uuid_azienda_ritiro_veicoli,
            ragione_sociale_arv,
            piva_arv
          `,
          { count: "exact" }
        )
        .order("ragione_sociale_arv", { ascending: true })
        .range(from, to)

      // 2) filtri ruolo
      // Se sei company mostri SOLO la tua azienda (uuidUtente = uuid_azienda_ritiro_veicoli)
      if (isCompany) {
        query = query.eq("uuid_azienda_ritiro_veicoli", uuidUtente)
      }

      // 3) search
      if (dataSearchSubmit) {
        const q = escapeLike(dataSearchSubmit)
        query = query.or(`ragione_sociale_arv.ilike.%${q}%,piva_arv.ilike.%${q}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Errore:", error)
        setAziendaRitiroVeicoli([])
        return
      }

      setAziendaRitiroVeicoli(data ?? [])
      
    }

    fetchData()
  }, [ role, uuidUtente, isAdmin, isTrasporter, isCompany, dataSearchSubmit, page, pageSize, from, to, statusAziende ])

  //PRATICHE APERTE DA COMPLETARE
  useEffect(() => {

    (async () => {
      const { data, error } = await supabase
        .from("dati_veicolo_ritirato")
        .select("*")
        .eq("pratica_completata", false)

      if (error) {
        console.error(error);
        return;
      }

      setDatiVeicoloRitirato(data);

    })();

  }, [statusAziende]);

  return (
    <div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full flex-1 flex flex-col md:p-0 md:pe-3 px-4 gap-4`}>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca ragione sociale o partita iva…"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand placeholder:text-xs placeholder:text-neutral-500 placeholder:italic"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>
      <div className="flex flex-col gap-3">
        {aziendaRitiroVeicoli.length ? aziendaRitiroVeicoli.map((a, index) => {
          
          const praticheAperte = datiVeicoloRitirato?.filter(ua => ua.uuid_azienda_ritiro_veicoli == a?.uuid_azienda_ritiro_veicoli).length
          const veicoliDaRitirare = datiVeicoloRitirato?.filter(ua => ua.uuid_azienda_ritiro_veicoli == a?.uuid_azienda_ritiro_veicoli).filter(da => da.demolizione_approvata !== true).length
          const attesaDiRitiro = datiVeicoloRitirato?.
          filter(ua => ua.uuid_azienda_ritiro_veicoli == a?.uuid_azienda_ritiro_veicoli).
          filter(da => da.demolizione_approvata == true).
          filter(ar => ar.veicolo_ritirato == false).length

          const uuid = a?.uuid_azienda_ritiro_veicoli ?? String(index);

          return (
            <DisplayAziendeRitiriDemolizioni key={uuid} ragioneSociale={a?.ragione_sociale_arv} piva={a?.piva_arv} uuid={uuid} n={praticheAperte} pl={veicoliDaRitirare} ar={attesaDiRitiro}/>
          );
        }) : (
            <span colSpan={8} className="h-24 text-center">Nessun risultato.</span>
        )}
      </div>
    </div>
  )
}
