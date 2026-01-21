"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPlusSquare, FaCar, FaMinusSquare, FaUser } from "react-icons/fa";
import { TiArrowBack } from "react-icons/ti";
import { FaBarcode, FaBuildingCircleArrowRight, FaCircleCheck } from "react-icons/fa6";
import { useAdmin } from "@/app/admin/components/AdminContext";
import TargaDesign from "@/app/componenti/targaDesign";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

export default function SECTIONtrasportoVeicoli({ onDisplay, setStatusAziende, statusAziende }) {
  const utente = useAdmin();
  const role = utente?.utente?.user_metadata.ruolo;
  const uuidUtente = utente?.utente?.id;
  const [updateList, setUpdateList] = useState(true);
  const [veicoliDaRitirare, setVeicoliDaRitirare] = useState([]);
  const [veicoliRitirati, setVeicoliRitirati] = useState([]);
  const [filterAzienda, setFilterAzienda] = useState("")
  const [aziende, setAziende] = useState([])
  const [camion, setCamion] = useState([]);
  const [autisti, setAutisti] = useState([]);
  const [formData, setFormData] = useState({
    camionRitiro: "",
    autistaRitiro: "",
    filtroData: dataOggiItalia(),
  });
  const isAdmin = role === "admin" || role === "superadmin";
  const isTrasporter = role === "transporter";
  const isCompany = role === "company";

  //GESTIONE DATA PER QUERY

  function dataOggiItalia() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function toUtcIsoFromRomeLocal(dateStr, timeStr = "00:00:00") {
    if (!dateStr || typeof dateStr !== "string") return null;

    const partsDate = dateStr.split("-");
    if (partsDate.length !== 3) return null;

    const [y, m, d] = partsDate.map(Number);
    if (!y || !m || !d) return null;

    const [hh, mm, ss] = timeStr.split(":").map(Number);

    const naiveUtc = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));

    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const parts = Object.fromEntries(
      fmt.formatToParts(naiveUtc).map((p) => [p.type, p.value])
    );
    const romeAsIfUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );

    const offsetMs = romeAsIfUtc - naiveUtc.getTime();
    return new Date(naiveUtc.getTime() - offsetMs).toISOString();
  }

  function addOneDay(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;

    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;

    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);

    const dt = new Date(Date.UTC(y, mo - 1, d));
    dt.setUTCDate(dt.getUTCDate() + 1);

    return dt.toISOString().slice(0, 10);
  }

  //GESTIONE FORM
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  //GESTIONE FORM
  function handleChangeFilterAzienda(e) {
    const { name, value } = e.target;
    setFilterAzienda(value);
  }

  //CARICAMENTO VEICOLI DA RITIRARE
  useEffect(() => {
    if (!role) return;
    if ((!isAdmin || !isTrasporter || isCompany) && !uuidUtente) return;

    const fetchData = async () => {
      let query = supabase
        .from("dati_veicolo_ritirato")
        .select(`*,
                aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv),
								modelloVeicolo:modello_veicolo(*)
                )`
        )
        .eq("pratica_completata", false)
        .eq("demolizione_approvata", true)
        .eq("veicolo_ritirato", false);

      if (isCompany) {
        query = query.eq("uuid_azienda_ritiro_veicoli", uuidUtente);
      }

      if ((isAdmin || isTrasporter) && filterAzienda) {
        query = query.eq("uuid_azienda_ritiro_veicoli", filterAzienda);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliDaRitirare(data ?? []);
    };

    fetchData();
  }, [role, uuidUtente, updateList, filterAzienda]);

  //CARICAMENTO VEICOLI RITIRATI
  useEffect(() => {
    if (!role) return;
    if ((!isAdmin || !isTrasporter || isCompany) && !uuidUtente) return;
    if (!formData.filtroData) return;

    const day = formData.filtroData;
    if (!day) return;

    const nextDayStr = addOneDay(day);
    if (!nextDayStr) return;

    const startIso = toUtcIsoFromRomeLocal(day, "00:00:00");
    const endIso = toUtcIsoFromRomeLocal(nextDayStr, "00:00:00");
    if (!startIso || !endIso) return;

    const fetchData = async () => {
      let query = supabase
        .from("log_trasporto_veicolo")
        .select(`*,
          camion:camion_trasporto_veicoli(targa_camion),
          autista:autista_camion_trasporto_veicoli(nome_autista,cognome_autista),
          veicoloRitirato:dati_veicolo_ritirato!inner(
            targa_veicolo_ritirato,
            veicolo_consegnato,
            uuid_azienda_ritiro_veicoli,
            aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv)
            )
          `
        )
        .eq("veicoloRitirato.veicolo_consegnato", false)
        .gte("created_at_log_trasporto_veicolo", startIso)
        .lt("created_at_log_trasporto_veicolo", endIso);

      if (isTrasporter) {
        query = query.eq("uuid_autista_ctv", uuidUtente);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliRitirati(data ?? []);
    };

    fetchData();
  }, [role, uuidUtente, updateList, formData.filtroData, statusAziende]);

  //CARICAMENTO CAMION
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("camion_trasporto_veicoli")
        .select("*")
        .eq("attivo_camion", true);

      if (error) {
        console.error(error);
        return;
      }

      setCamion(data);
    })();
  }, []);

  //CARICAMENTO AZIENDE
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("azienda_ritiro_veicoli")
        .select("uuid_azienda_ritiro_veicoli, ragione_sociale_arv, attiva_arv")
        .eq("attiva_arv", true);

      if (error) {
        console.error(error);
        return;
      }

      setAziende(data);
    })();
  }, []);

  const optionCamion = (camion ?? []).map((c) => ({
    value: c.uuid_camion_trasporto_veicoli,
    label: c.targa_camion,
  }));

  //CARICAMENTO AUTISTI
  useEffect(() => {
    if (!role) return;
    if ((!isAdmin && !uuidUtente) || (!isTrasporter && !uuidUtente)) return;

    const fetchData = async () => {
      let query = supabase
        .from("autista_camion_trasporto_veicoli")
        .select("*")
        .eq("attivo_autista", true);

      if (isTrasporter) {
        query = query.eq("uuid_autista_ctv", uuidUtente);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }

      setAutisti(data ?? []);
    };

    fetchData();
  }, [role, uuidUtente]);

  const optionAutisti = (autisti ?? []).map((c) => ({
    value: c?.uuid_autista_ctv,
    label: `${c?.cognome_autista} ${c?.nome_autista}`,
  }));

  const optionAziende = (aziende ?? []).map((a) => ({
    value: a?.uuid_azienda_ritiro_veicoli,
    label: `${a?.ragione_sociale_arv}`,
  }));

	async function StatusUpdate(uuidVeicolo, uuidStatoAvanzamento) {

		const payloadStatus = {
			uuid_veicolo_ritirato: uuidVeicolo,
			uuid_stato_avanzamento: uuidStatoAvanzamento,
		};

		const { data, error } = await supabase
			.from("log_avanzamento_demolizione")
			.insert(payloadStatus)
			.select()
			.single();

		if (error) {
			console.log("Errore statusUpdate:", error);
		} else {
			console.log("Stato aggiornato:", data);
		}

	}

	async function StatusDowngrade(uuidVeicolo, uuidStatoAvanzamento) {

		const { data, error } = await supabase
			.from("log_avanzamento_demolizione")
      .delete()
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
			.eq("uuid_stato_avanzamento", uuidStatoAvanzamento)

		if (error) {
			console.log("Errore statusUpdate:", error);
		} else {
			console.log("Stato aggiornato:", data);
		}

	}

  // INSERIMENTO RITIRO VEICOLO
  async function RitiroVeicolo(uuidVeicolo, uuidCamion, uuidAutista) {

    if (!uuidVeicolo) return alert("seleziona un veicolo");
    if (!uuidCamion) return alert("seleziona un camion");
    if (!uuidAutista) return alert("seleziona l'autista");

    const payloadVR = {
      veicolo_ritirato: true,
    };

    const { data: vrData, error: vrError } = await supabase
      .from("dati_veicolo_ritirato")
      .update(payloadVR)
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .select()
      .single();

    if (vrError) {
      console.error(vrError);
      alert(`Errore salvataggio: ${vrError.message}`);
      return;
    }

    const payloadT = {
      uuid_veicolo_ritirato: uuidVeicolo,
      uuid_camion_tv: uuidCamion,
      uuid_autista_ctv: uuidAutista,
    };

    const { data: trasportoData, error: trasportoError } = await supabase
      .from("log_trasporto_veicolo")
      .insert(payloadT)
      .select()
      .single();

    if (trasportoError) {
      console.error(trasportoError);
      alert(`Errore salvataggio: ${trasportoError.message}`);
      return;
    }

    await StatusUpdate(uuidVeicolo, "6adcebac-6465-452a-974d-912e1caab37b") //IN TRANSITO

    setUpdateList((prev) => !prev);
    setStatusAziende(prev => !prev)
    alert("Trasporto Inserito con successo");
  }

  async function EliminaRitiro(uuidVeicolo, uuidLog) {
    if (!uuidVeicolo) return alert("seleziona un veicolo");
    if (!uuidLog) return alert("seleziona Log");

    // 1) Controllo: veicolo_consegnato deve essere false su dati_veicolo_ritirato
    const { data: veicoloRow, error: checkErr } = await supabase
      .from("dati_veicolo_ritirato")
      .select("uuid_veicolo_ritirato, veicolo_consegnato")
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .maybeSingle();

    if (checkErr) {
      console.error(checkErr);
      alert(`Errore verifica: ${checkErr.message}`);
      return;
    }

    if (!veicoloRow) {
      alert("Veicolo non trovato.");
      return;
    }

    if (veicoloRow.veicolo_consegnato !== false) {
      alert("Non puoi eliminare: il veicolo risulta consegnato.");
      return;
    }

    // 2) Update veicolo_ritirato -> false
    const { error: vrError } = await supabase
      .from("dati_veicolo_ritirato")
      .update({ veicolo_ritirato: false })
      .eq("uuid_veicolo_ritirato", uuidVeicolo);

    if (vrError) {
      console.error(vrError);
      alert(`Errore salvataggio: ${vrError.message}`);
      return;
    }

    // 3) Delete log SOLO se appartiene a quel veicolo (extra sicurezza)
    const { data: trasportoData, error: trasportoError } = await supabase
      .from("log_trasporto_veicolo")
      .delete()
      .eq("uuid_log_trasporto_veicolo", uuidLog)
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .select()
      .maybeSingle();

    if (trasportoError) {
      console.error(trasportoError);
      alert(`Errore eliminazione trasporto: ${trasportoError.message}`);
      return;
    }

    if (!trasportoData) {
      alert("Nessun log eliminato (log non trovato o non associato al veicolo).");
      return;
    }

    await StatusDowngrade(uuidVeicolo, "6adcebac-6465-452a-974d-912e1caab37b"); // IN TRANSITO

    setUpdateList((prev) => !prev);
    setStatusAziende((prev) => !prev);
    alert("Trasporto Eliminato");
  }

  return (
    <>
      <div className={`${onDisplay === true ? "" : "hidden"} w-full h-full`}>
        <div className="flex lg:flex-row flex-col flex-wrap lg:gap-y-3 gap-y-1 w-full min-h-0">
          {/* CRUSCOTTO */}
          {/* <div className="flex flex-row w-full gap-4 min-h-0 p-5 rounded-2xl bg-neutral-950">
            <div className="flex flex-row justify-between">
              <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                CRUSCOTTO
              </h4>
            </div>
          </div> */}
          {/* SELEZIONA CAMION E AUTISTA E DATA */}
          <div className="flex lg:flex-row flex-col justify-between w-full gap-4 min-h-0 p-5 rounded-2xl border bg-white dark:bg-neutral-900">
            <div className="flex flex-row lg:basis-6/12 basis-full">
              <FormSelect
                nome="camionRitiro"
                label="Camion"
                anteValue="Camion"
                value={formData.camionRitiro}
                onchange={handleChange}
                options={optionCamion}
              />
            </div>
            <div className="flex flex-row lg:basis-5/12 basis-full">
              <FormSelect
                nome="autistaRitiro"
                label="Autista"
                anteValue="Autista"
                value={formData.autistaRitiro}
                onchange={handleChange}
                options={optionAutisti}
              />
            </div>
            <div className="flex flex-col lg:basis-1/12 basis-full gap-2">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
              DATA RITIRO
            </h4>
            <FormField
              nome="filtroData"
              label="data"
              value={formData.filtroData}
              onchange={handleChange}
              type="date"
            />
            </div>
            
          </div>
          {/* VEICOLI DA RITIRARE */}
          <div className={`flex flex-col gap-4 ${veicoliRitirati.length > 0 ? `xl:basis-6/12 w-full` : `xl:basis-12/12 w-full`}  p-1`}>
            <div className="flex flex-col border border-brand p-5 rounded-2xl h-full gap-2 bg-white dark:bg-neutral-900">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                  <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                    VEICOLI DA RITIRARE
                  </h4>
                  <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                    SELEZIONA AZIENDA
                  </h4>
                </div>
                <div className="flex flex-row justify-between gap-2 items-center max-w-full overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    <FormSelect
                      nome="aziendaFiltro"
                      anteValue="Azienda"
                      classAdd={`flex-1`}
                      value={filterAzienda}
                      onchange={handleChangeFilterAzienda}
                      options={optionAziende}
                    />
                  </div>
                  <div className="w-fit">
                    <button onClick={()=>setFilterAzienda("")} className="bg-brand/50 p-2 w-fit rounded-lg hover:bg-brand transition"><TiArrowBack/></button>
                  </div>
                </div>
              </div>  
              <div className="flex flex-col gap-2 overflow-auto">
                {veicoliDaRitirare?.map((c, i) => (
                  <div key={c.uuid_veicolo_ritirato} className="flex flex-row justify-between border hover:border-brand transition p-3 rounded-xl">
                    <div className="flex flex-wrap items-start gap-1">
                      <div className="flex flex-wrap gap-2">
                        <div className="w-36"><TargaDesign targa={c?.targa_veicolo_ritirato}/></div>
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaBuildingCircleArrowRight className="text-sky-700"/>{c?.aziendaRitiro?.ragione_sociale_arv}</div>
											</div>
                      <div className="flex flex-wrap gap-1">
												<div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaUser className="text-orange-500"/>{c?.nome_detentore} {c?.cognome_detentore}</div>
												<div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaBarcode className="text-orange-500"/>{c?.cf_detentore}</div>
											</div>
                      <div className="flex flex-wrap gap-1 pe-5">
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg"><FaCar className="text-brand"/>{c?.modelloVeicolo.marca} {c?.modelloVeicolo.modello}</div>
                        <div className="flex flex-row items-center gap-1 text-xs border py-1 px-2 rounded-lg uppercase"><FaCircleCheck className="text-brand"/>{c?.stato_gravami}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ButtonRitiraVeicolo
                        onClick={() =>
                          RitiroVeicolo(
                            c?.uuid_veicolo_ritirato,
                            formData?.camionRitiro,
                            formData?.autistaRitiro
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* VEICOLI RITIRATI */}
          {veicoliRitirati.length > 0 ? 
          <div className="flex flex-col gap-2 xl:basis-6/12 w-full p-1">
            <div className="flex flex-col border border-brand p-5 rounded-2xl h-full gap-2">
              <div className="flex flex-row justify-between items-start">
                <h4 className="h-fit text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                  VEICOLI RITIRATI
                </h4>
                <FormField
                  nome="filtroData"
                  label="data"
                  value={formData.filtroData}
                  onchange={handleChange}
                  type="date"
                />
              </div>
              <div className="flex flex-col gap-2 overflow-auto pe-2">
                {veicoliRitirati?.length > 0 ? veicoliRitirati?.map((vr, i) => (
                  <div key={vr.uuid_log_trasporto_veicolo} className="flex flex-row justify-between border hover:border-brand transition p-3 gap-2 rounded-xl">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="w-36">
                        <TargaDesign
                          targa={vr?.veicoloRitirato?.targa_veicolo_ritirato}
                        />
                      </div>
                      <div className="flex lg:items-center items-start flex-wrap lg:gap-2 gap-1">
                        <span className="text-xs border px-2 py-1 rounded-lg truncate">
                          {
                            vr?.veicoloRitirato?.aziendaRitiro?.ragione_sociale_arv
                          }
                        </span>
                        <span className="text-xs bg-brand/30 px-2 py-1 rounded-lg">{vr?.autista?.nome_autista} {vr?.autista?.cognome_autista} / {vr?.camion?.targa_camion}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ButtonEliminaRitira
                        onClick={() =>
                          EliminaRitiro(
                            vr?.uuid_veicolo_ritirato,
                            vr?.uuid_log_trasporto_veicolo
                          )
                        }
                      />
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          </div> : null }
        </div>
      </div>
    </>
  );
}

export function ButtonRitiraVeicolo({ onClick }) {
  return (
    <>
      <button onClick={onClick}>
        <FaPlusSquare className="dark:text-white text-brand"/>
      </button>
    </>
  );
}

export function ButtonEliminaRitira({ onClick }) {
  return (
    <>
      <button onClick={onClick} className="text-red-500">
        <FaMinusSquare />
      </button>
    </>
  );
}

export function FormSelect({ nome, label, value, onchange, options, anteValue = [], classAdd }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } });
  };
  return (
    <div className={`flex flex-col gap-2 w-full ${classAdd}`}>
      <label
        className={`${label ? null : `hidden`} text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl uppercase`}
        htmlFor={nome}
      >
        {label ? label : null}
      </label>
      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${anteValue} --`} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[70] max-w-full">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="data-[state=checked]:bg-brand data-[state=checked]:text-foreground focus:bg-brand truncate overflow-hidden"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  );
}

export function FormField({ nome, label, value, onchange, type }) {
  return (
    <div className={`w-fit`}>
      <Input
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value}
        onChange={onchange}
        className={`appearance-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand`}
      />
    </div>
  );
}
