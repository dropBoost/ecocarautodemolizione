'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FaUserSlash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { FaFileDownload } from "react-icons/fa";
import { FaCircle, FaDotCircle } from "react-icons/fa";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DisplayAziendeRitiro from "./componenti/displayAziendeRitiro";

export default function ElencoAziende({ onDisplay, statusAziende, setStatusAziende }) {
  const [aziendaRitiroVeicoli, setAziendaRitiroVeicoli] = useState([])

  // ricerca
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato

  // paginazione
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  // calcolo indici per Supabase range (inclusivo)
  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

  // handlers ricerca
  function handleChangeSearchBar(e) {
    setDataSearch(e.target.value)
  }
  function handleSearchClick() {
    setDataSearchSubmit(dataSearch.trim())
    setPage(1) // 🔑 reset pagina quando applichi filtro
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
    const fetchData = async () => {
      let query = supabase
        .from("azienda_ritiro_veicoli")
        .select(`
        uuid_azienda_ritiro_veicoli,
        ragione_sociale_arv,
        piva_arv,
        sdi_arv,
        cap_legale_arv,
        citta_legale_arv,
        provincia_legale_arv,
        indirizzo_legale_arv,
        cap_operativa_arv,
        citta_operativa_arv,
        provincia_operativa_arv,
        indirizzo_operativa_arv,
        email_arv,
        telefono_arv,
        mobile_arv,
        mobile_autista_arv,
        attiva_arv,
        created_at_arv,
        uuid_rules,
        ruolo:rules_user(
          alias_rules
        )`, { count: "exact" })
        .order("ragione_sociale_arv", { ascending: false })
        .range(from, to)

      if (dataSearchSubmit) {
        const q = escapeLike(dataSearchSubmit)
        query = query.or(
          `ragione_sociale_arv.ilike.*${q}*,` +
          `piva_arv.ilike.*${q}*,` +
          `email_arv.ilike.*${q}*`
        );
      }

      const { data, error, count } = await query
      if (error) {
        console.error("Errore:", error)
        setAziendaRitiroVeicoli([])
        setTotalCount(0)
        return
      }
      setAziendaRitiroVeicoli(data ?? [])
      setTotalCount(count ?? 0)

      // se filtro/pagina porta fuori range, riporta a ultima pagina valida
      if ((count ?? 0) > 0 && page > Math.ceil((count ?? 0) / pageSize)) {
        setPage(1)
      }
    }

    fetchData()
  }, [dataSearchSubmit, page, pageSize, from, to, statusAziende])

  const iconaCestino = <FaUserSlash/>

  return (
    <div className={`${onDisplay === 'on' ? '' : 'hidden'}
      w-full h-full
      flex-1 flex flex-col
      md:p-0 md:pe-3 px-4 gap-4`}>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca azienda, partita iva o email"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand placeholder:text-xs placeholder:text-neutral-500 placeholder:italic"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>
      <div className="flex items-center p-2 border rounded-lg">
        <span className="text-xs text-neutral-400">Aziende Attive: <font>{`${aziendaRitiroVeicoli?.filter(a => a.attiva_arv == true).length}`}</font> / <font>{`${aziendaRitiroVeicoli?.length}`}</font></span>
      </div>
      <div className="flex flex-col gap-3">
        {aziendaRitiroVeicoli?.length ? aziendaRitiroVeicoli.map((a, index) => {
          
          const uuid = a?.uuid_azienda_ritiro_veicoli ?? String(index);

          return (
            <DisplayAziendeRitiro key={uuid}
            ragioneSociale={a?.ragione_sociale_arv} piva={a?.piva_arv} sdi={a?.sdi_arv} uuid={uuid}
            sedeLegale={`${a?.indirizzo_legale_arv} - ${a?.cap_legale_arv} ${a?.citta_legale_arv} ${a?.provincia_legale_arv}`}
            tel={a?.telefono_arv} mobile={a?.mobile_arv} email={a?.email_arv}
            rules={a.ruolo.alias_rules} stato={a?.attiva_arv} setStatusAziende={setStatusAziende}
            />
          );
        }) : (
            <span colSpan={8} className="h-24 text-center">Nessun risultato.</span>
        )}
      </div>

      </div>
  )
}
