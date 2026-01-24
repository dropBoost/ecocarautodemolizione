'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { FaUserSlash } from "react-icons/fa";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import DisplayAziendeElencoDemolizioni from "./componenti/displayAziendeElencoDemolizioni";
import { useAdmin } from "@/app/admin/components/AdminContext";

export default function ElencoCertificatiDemolizione({ onDisplay, statusAziende, setStatusAziende }) {
  const [aziendaRitiroVeicoli, setAziendaRitiroVeicoli] = useState([])
  const [praticheAperte, setPraticheAperte] = useState([])
	const utente = useAdmin()
	const role = utente?.utente?.user_metadata?.ruolo;
	const uuidUtente = utente?.utente?.id;
	const [ruoliUtente, setRuoliUtente] = useState([]);

  // ricerca
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato
  const [countDemolizione, setCountDemolizione] = useState()

  // paginazione
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // calcolo indici per Supabase range (inclusivo)
  const { from, to } = useMemo(() => {
    const start = (page - 1) * pageSize
    return { from: start, to: start + pageSize - 1 }
  }, [page, pageSize])

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

  // handlers ricerca
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

  // CARICAMENTO RUOLI
  useEffect(() => {
    (async () => {
      const { data: ruoliData, error } = await supabase
        .from("rules_user")
        .select("*")
        .order("alias_rules", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento personal Trainer");
        return;
      }
      setRuoliUtente(ruoliData ?? []);
    })();
  }, []);

	const isAdmin = role === "admin" || role === "superadmin";
  const isCompany = role === "company";

	useEffect(() => {
		if (!role) return;
		if (!uuidUtente) return;

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
				.order("ragione_sociale_arv", { ascending: false })
				.range(from, to);

			if (isCompany) {
				query = query.eq("uuid_azienda_ritiro_veicoli", uuidUtente);
			}

			if (dataSearchSubmit) {
				const q = escapeLike(dataSearchSubmit);
				query = query.or(
					`ragione_sociale_arv.ilike.*${q}*,piva_arv.ilike.*${q}*`
				);
			}

			const { data, error, count } = await query;

			if (error) {
				console.error("Errore aziende:", error.message ?? error);
				setAziendaRitiroVeicoli([]);
				setTotalCount?.(0);
				return;
			}

			setAziendaRitiroVeicoli(data ?? []);
		};

		fetchData();
	}, [
		role,
		uuidUtente,
		isCompany,
		dataSearchSubmit,
		statusAziende,
		from,
		to,
	]);

  //PRATICHE APERTE
  useEffect(() => {
    if (!aziendaRitiroVeicoli) return;

    (async () => {
      const { data, error } = await supabase
        .from("v_pratiche_aperte_per_azienda")
        .select("*")

      if (error) {
        console.error(error);
        return;
      }

      setPraticheAperte(data);

    })();

  }, [statusAziende]);

  //CERTIFICATI DEMOLIZIONE COUNT
  useEffect(() => {

    (async () => {
      const { data, error } = await supabase
        .from("certificato_demolizione")
        .select(`
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
        `)
        .eq("demolizione_completata", "true")

      if (error) {
        console.error("ERRORE CERTIFICATI DEMOLIZIONE:", error)
        return
      }

      setCountDemolizione(data ?? [])
    })()
  }, [statusAziende])

  return ( 
	<div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full flex-1 flex flex-col md:p-0 md:pe-3 px-4 gap-4`}>
		{/* Barra ricerca */}
		<div className="flex w-full items-center gap-2">
			<Input type="text" id="cerca" placeholder="Cerca ragione sociale o partita iva…" value={dataSearch} onChange={handleChangeSearchBar} onKeyDown={handleSearchKeyDown} className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand placeholder:text-xs placeholder:text-neutral-500 placeholder:italic"/>
			<Button type="button" onClick={handleSearchClick}>Cerca</Button>
			<Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
		</div>
		<div className="flex flex-col gap-3">
			{aziendaRitiroVeicoli.length ? aziendaRitiroVeicoli.map((a, index) => {
				
				const n = countDemolizione?.filter(ua => ua.dati_veicolo_ritirato?.uuid_azienda_ritiro_veicoli === a?.uuid_azienda_ritiro_veicoli)?.length ?? 0
				const uuid = a?.uuid_azienda_ritiro_veicoli ?? String(index);

				return (
					<DisplayAziendeElencoDemolizioni key={uuid} ragioneSociale={a?.ragione_sociale_arv} piva={a?.piva_arv} uuid={uuid} n={n}/>
				);
			}) : (
					<span colSpan={8} className="h-24 text-center">Nessun risultato.</span>
			)}
		</div>
    </div>
  )
}
