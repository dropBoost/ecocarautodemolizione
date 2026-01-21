"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPlusSquare, FaCar, FaMinusSquare, FaUser, FaClock, FaCalendar, FaCloudDownloadAlt } from "react-icons/fa";
import { RiEyeCloseLine, RiMapPinUserFill } from "react-icons/ri";
import { FaBarcode, FaBuildingCircleArrowRight, FaCircleCheck, FaTruckMoving } from "react-icons/fa6";
import { useAdmin } from "@/app/admin/components/AdminContext";
import Link from "next/link";
import ExportExcelButton from "@/app/componenti/excel/exportExcel";

export default function SECTIONcronologiaTrasporti({ onDisplay, setStatusAziende, statusAziende }) {
  const utente = useAdmin();
  const role = utente?.utente?.user_metadata.ruolo;
  const [veicoliRitirati, setVeicoliRitirati] = useState([]);
  const [data, setData] = useState(()=>dataOggiItalia())

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
  const dataOggi = dataOggiItalia()

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

  function DataFormat(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d)) return '—'
    return (
      <>
      <div className="w-full flex lg:flex-row flex-col gap-2 justify-end items-end">
        <div className="flex flex-row items-center gap-2"><FaCalendar className="text-brand"/>{d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' })} </div>
        <div className="flex flex-row items-center gap-2"><FaClock className="text-brand"/>{d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</div>
      </div>
      </>
    )
  } 

  //CARICAMENTO VEICOLI RITIRATI CRONOLOGIA
  useEffect(() => {

    const day = data

    const startIso = toUtcIsoFromRomeLocal(day, "00:00:00");
    const endIso = toUtcIsoFromRomeLocal(day, "23:59:59");
    if (!startIso || !endIso) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("log_trasporto_veicolo")
        .select(`*,
          camion:camion_trasporto_veicoli(targa_camion),
          autista:autista_camion_trasporto_veicoli(nome_autista,cognome_autista),
          veicoloRitirato:dati_veicolo_ritirato!inner(
            targa_veicolo_ritirato,
            vin_veicolo_ritirato,
            veicolo_consegnato,
            uuid_modello_veicolo,
            uuid_azienda_ritiro_veicoli,
            aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv),
            modelloVeicolo:modello_veicolo(modello,marca)
            )
          `
        )
        .gte("created_at_log_trasporto_veicolo", startIso)
        .lt("created_at_log_trasporto_veicolo", endIso);

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliRitirati(data ?? []);

    };

    fetchData();
  }, [data]);
  
  function handleChangeData(e) {
    const { name, value } = e.target;
    setData(value);
    if (value > dataOggi) (
      setData(dataOggi)
    )
  }
  
  const columns = [
    { header: "Codice Pratica", key: "codice", width: 42 },
    { header: "Targa Veicolo Ritirato", key: "targa", width: 24 },
    { header: "Modello Veicolo", key: "modello_veicolo", width: 34 },
    { header: "VIN Veicolo", key: "vin_veicolo", width: 28 },
    { header: "Azienda Ritiro Veicolo", key: "azienda_ritiro", width: 34 },
    { header: "Camion", key: "camion", width: 16 },
    { header: "Autista", key: "autista", width: 30 },
    { header: "Data Ritiro", key: "data", width: 20, type: "datetime" },
  ];

  const rows = veicoliRitirati.map(v => ({
    codice: v?.uuid_veicolo_ritirato,
    targa: v?.veicoloRitirato?.targa_veicolo_ritirato ?? "",
    modello_veicolo: `${v?.veicoloRitirato?.modelloVeicolo?.marca} ${v?.veicoloRitirato?.modelloVeicolo?.modello}` ?? "",
    vin_veicolo: v?.veicoloRitirato?.vin_veicolo_ritirato ?? "",
    azienda_ritiro: v?.veicoloRitirato?.aziendaRitiro?.ragione_sociale_arv ?? "",
    camion: v?.camion?.targa_camion ?? "",
    autista:`${v?.autista?.cognome_autista} ${v?.autista?.nome_autista}`,
    data: v?.created_at_log_trasporto_veicolo ? new Date(v?.created_at_log_trasporto_veicolo) : null,
  }));

  return (
    <>
      {isAdmin ? 
      <div className={`${onDisplay === true ? "" : "hidden"} w-full h-full`}>
        <div className="flex lg:flex-row flex-col flex-wrap lg:gap-y-3 gap-y-1 w-full min-h-0">
          {/* VEICOLI RITIRATI */}
          <div className="flex flex-col gap-2 xl:basis-12/12 w-full">
            <div className="flex flex-row justify-between items-start">
              <h4 className="h-fit text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                CRONOLOGIA VEICOLI RITIRATI
              </h4>
              <div className="flex flex-row items-center justify-center gap-2">
                <FormField
                  nome="filtroData"
                  label="data"
                  value={data}
                  onchange={handleChangeData}
                  type="date"
                />
                <ExportExcelButton
                  columns={columns}
                  rows={rows}
                  data={data}
                  filename={`Veicoli_transito_${data}.xlsx`}
                  sheetName={`VT-${data}`}
                  className="flex flex-row items-center gap-1 h-fit text-[0.6rem] font-bold text-white border hover:bg-brand bg-brand/50 transition px-3 py-2 w-fit rounded-xl"
                ><FaCloudDownloadAlt/> ESPORTA </ExportExcelButton>
              </div>
            </div>
            <div className="flex flex-col p-5 h-full gap-3 bg-white dark:bg-neutral-950/50 rounded-xl">
              <div className="flex flex-col gap-2 overflow-auto pe-2">
                {veicoliRitirati?.length > 0 ? veicoliRitirati?.map((vr, i) => (
                  <div key={vr.uuid_log_trasporto_veicolo} className="flex flex-row justify-between border-b pb-2 border-brand/20 h-full gap-3">
                    <div className="flex flex-wrap flex-1 items-center justify-start gap-1 border-e pe-5">
                      <span className="bg-white text-blue-900 font-bold text-xs rounded-md px-2 py-1">{vr?.veicoloRitirato?.targa_veicolo_ritirato}</span>
                      <span className="text-white bg-blue-900 font-bold text-xs rounded-md px-2 py-1">{vr?.veicoloRitirato?.modelloVeicolo?.marca} {vr?.veicoloRitirato?.modelloVeicolo?.modello}</span>
                      <span className="border text-xs rounded-md px-2 py-1 font-medium truncate lg:w-fit w-48">{vr?.veicoloRitirato?.aziendaRitiro?.ragione_sociale_arv}</span>
                      <span className="flex flex-row items-center gap-1 bg-brand/50 text-xs rounded-md px-2 py-1"><RiMapPinUserFill/> {vr?.autista?.nome_autista} {vr?.autista?.cognome_autista}</span>
                      <span className="flex flex-row items-center gap-1 bg-brand/50 text-xs rounded-md px-2 py-1"><FaTruckMoving/>{vr?.camion?.targa_camion}</span>
                      {vr?.veicoloRitirato?.vin_veicolo_ritirato ? <span className="flex flex-row items-center gap-1 bg-orange-700 text-xs rounded-md px-2 py-1 italic"><FaBarcode/> {vr?.veicoloRitirato?.vin_veicolo_ritirato}</span> : null}
                    </div>
                    <div className="flex lg:flex-row flex-col justify-end items-end gap-1 h-fit">
                      <span className="border text-xs rounded-md px-2 py-1">{DataFormat(vr?.created_at_log_trasporto_veicolo)}</span>
                      <Link className="flex bg-brand/50 rounded-md transition-all hover:bg-brand items-center text-center justify-center text-xs p-2 aspect-square w-fit" href={`ritiri-demolizioni/${vr?.veicoloRitirato?.uuid_azienda_ritiro_veicoli}/${vr?.uuid_veicolo_ritirato}`}><RiEyeCloseLine/></Link>
                    </div>
                  </div>
                )) : "... nessun veicolo ritirato"}
              </div>
            </div>
          </div>
        </div>
      </div> : "non hai l'autorizzazione per accedere a quest'area" }
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
        className={`h-fit text-xs appearance-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand`}
      />
    </div>
  );
}