"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPlusSquare, FaCar, FaMinusSquare, FaUser, FaClock, FaCalendar, FaCloudDownloadAlt, FaFileDownload } from "react-icons/fa";
import { RiEyeCloseLine, RiMapPinUserFill } from "react-icons/ri";
import { FaBarcode, FaBuildingCircleArrowRight, FaCircleCheck, FaTruckMoving } from "react-icons/fa6";
import { useAdmin } from "@/app/admin/components/AdminContext";
import Link from "next/link";
import ExportExcelButton from "@/app/componenti/excel/exportExcel";
import { cn } from "@/lib/utils";
import { AiOutlineLoading3Quarters, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai'
import { AiOutlineCloudUpload } from "react-icons/ai";
import { toast } from "sonner";

export default function SECTIONradiazioniPRA({ onDisplay, setStatusAziende, statusAziende }) {

  const utente = useAdmin();
  const role = utente?.utente?.user_metadata.ruolo;
  const [certificatiDemolizione, setCertificatiDemolizione] = useState([])
  const [uploadingByField, setUploadingByField] = useState({});
  const [uploadsByUuid, setUploadsByUuid] = useState({});
  const [resetUploadsTick, setResetUploadsTick] = useState(0);
  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const [data, setData] = useState(()=>dataOggiItalia())
  const [ricarica, setRicarica] = useState(0)

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
  function handleBusyChange(nomeCampo, isBusy) {
    setUploadingByField(prev => ({ ...prev, [nomeCampo]: isBusy }));
  }
  //CARICAMENTO VEICOLI RITIRATI CRONOLOGIA
  useEffect(() => {

    const day = data

    const startIso = toUtcIsoFromRomeLocal(day, "00:00:00");
    const endIso = toUtcIsoFromRomeLocal(day, "23:59:59");
    if (!startIso || !endIso) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('certificato_demolizione')
        .select(`*,
          veicoloRitirato:dati_veicolo_ritirato!inner(
            targa_veicolo_ritirato,
            vin_veicolo_ritirato,
            veicolo_consegnato,
            uuid_modello_veicolo,
            nome_detentore,
            cognome_detentore,
            uuid_azienda_ritiro_veicoli,
            aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv),
            modelloVeicolo:modello_veicolo(modello,marca)
            )
          `
        )
        .gte("created_at_certificato_demolizione", startIso)
        .lt("created_at_certificato_demolizione", endIso);

      if (error) {
        console.error(error);
        return;
      }

      setCertificatiDemolizione(data ?? []);

    };

    fetchData();
  }, [data, ricarica]);
  
  function handleChangeData(e) {
    const { name, value } = e.target;
    setData(value);
    if (value > dataOggi) (
      setData(dataOggi)
    )
  }

  function handleChangeUpload(uuid, e) {
    const first = e?.target?.files?.[0] || null;
    setUploadsByUuid(prev => ({ ...prev, [uuid]: first }));
  }

  async function handleSubmit(e, uuid, certificatoPra) {
    e.preventDefault()
    if (anyUploading) return

    if (certificatoPra) return

    if (!uuid) {
      toast.error("codice pratica demolizione mancante")
      return
    }

    const file = uploadsByUuid[uuid];   // ✅ prende quello della riga giusta
    if (!file?.path) {
      toast.error("Carica prima un documento")
      return
    }

    const { error } = await supabase
      .from("certificato_demolizione")
      .update({ altro_documento_demolizione: file.url })
      .eq("uuid_certificato_demolizione", uuid)

    if (error) {
      console.error(error)
      toast.error(`Errore salvataggio: ${error.message}`)
      return
    }

    toast.success("Radiazione PRA inserita")

    setResetUploadsTick(t => t + 1)
    setUploadsByUuid({})
    setRicarica(prev => !prev)
  }

  console.log(certificatiDemolizione)
  return (
    <>
      {isAdmin ? 
      <div className={`${onDisplay === true ? "" : "hidden"} w-full h-full`}>
        <div className="flex lg:flex-row flex-col flex-wrap lg:gap-y-3 gap-y-1 w-full min-h-0">
          {/* VEICOLI DEMOLITI */}
          <div className="flex flex-col gap-2 xl:basis-12/12 w-full">
            <div className="flex flex-row justify-between items-start">
              <h4 className="h-fit text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
                CRONOLOGIA DEMOLIZIONI
              </h4>
              <div className="flex flex-row items-center justify-center gap-2">
                <FormField
                  nome="filtroData"
                  label="data"
                  value={data}
                  onchange={handleChangeData}
                  type="date"
                />
              </div>
            </div>
            <div className="flex flex-col p-5 h-full gap-3 bg-white dark:bg-neutral-950/50 rounded-xl">
              <div className="flex flex-col gap-2 overflow-auto pe-2">
                {certificatiDemolizione?.length > 0 ? certificatiDemolizione?.map((vr, i) => (
                  <div key={vr?.uuid_certificato_demolizione} className="flex flex-row justify-between border-b pb-2 border-brand/20 h-full gap-3">
                    <div className="flex flex-wrap flex-1 items-center h-fit xl:h-8 justify-start gap-1 border-e pe-5">
                      <span className="bg-white text-blue-900 font-bold text-xs rounded-md px-2 py-1">{vr?.veicoloRitirato?.targa_veicolo_ritirato}</span>
                      <span className="text-white bg-blue-900 font-bold text-xs rounded-md px-2 py-1">{vr?.veicoloRitirato?.modelloVeicolo?.marca} {vr?.veicoloRitirato?.modelloVeicolo?.modello}</span>
                      <span className="flex flex-row items-center gap-1 bg-brand/50 text-xs rounded-md px-2 py-1"><RiMapPinUserFill/> {vr?.veicoloRitirato?.cognome_detentore} {vr?.veicoloRitirato?.nome_detentore}</span>
                      {vr?.veicoloRitirato?.vin_veicolo_ritirato ? <span className="flex flex-row items-center gap-1 bg-orange-700 text-xs rounded-md px-2 py-1 italic"><FaBarcode/> {vr?.veicoloRitirato?.vin_veicolo_ritirato}</span> : null}
                    </div>
                    <div className="flex lg:flex-row flex-col justify-end items-end gap-1 h-fit">
                      <span className="hidden lg:block border text-xs rounded-md px-2 py-1">{DataFormat(vr?.created_at_certificato_demolizione)}</span>
                      <Link className="flex bg-brand/50 rounded-md transition-all hover:bg-brand items-center text-center justify-center text-xs p-2 aspect-square w-fit" href={`ritiri-demolizioni/${vr?.veicoloRitirato?.uuid_azienda_ritiro_veicoli}/${vr?.uuid_veicolo_ritirato}`}><RiEyeCloseLine/></Link>
                      {vr?.documento_demolizione !== "" ? 
                        <Link className="flex bg-sky-600/50 rounded-md transition-all hover:bg-sky-500 items-center text-center justify-center text-xs p-2 aspect-square w-fit" href={`${vr?.documento_demolizione}?download`} target="_blank">
                          <FaFileDownload/>
                        </Link> : null
                      }
                      {vr?.altro_documento_demolizione !== "" ? 
                        <Link className="flex bg-orange-500/50 rounded-md transition-all hover:bg-orange-500 items-center text-center justify-center text-xs p-2 aspect-square w-fit" href={`${vr?.altro_documento_demolizione}?download`} target="_blank">
                          <FaFileDownload/>
                        </Link> : null
                      }
                      {vr?.altro_documento_demolizione === "" ? 
                      <form onSubmit={(e) => handleSubmit(e, vr?.uuid_certificato_demolizione, vr?.altro_documento_demolizione)} className="flex flex-row gap-1">
                        <FormFileUploadIcon
                          nome={`altroDocumentoDemolizione-${vr?.uuid_certificato_demolizione}`} // ✅ unico
                          bucket="documentiveicoli"
                          accept="image/*,application/pdf"
                          campo="radiazione-pra"
                          targa={vr?.veicoloRitirato?.targa_veicolo_ritirato}
                          makePublic={true}
                          onchange={(e) => handleChangeUpload(vr?.uuid_certificato_demolizione, e)} // ✅ passa uuid
                          onBusyChange={handleBusyChange}
                          resetToken={resetUploadsTick} // ✅ globale (resetta tutti)
                          className="flex bg-orange-500/50 rounded-md transition-all hover:bg-orange-500 items-center text-center justify-center text-xs p-2 aspect-square w-fit"
                          pathPrefix={`public/${vr?.veicoloRitirato?.uuid_azienda_ritiro_veicoli}/${vr?.veicoloRitirato?.targa_veicolo_ritirato}`}
                        />

                        <button
                          type="submit"
                          disabled={anyUploading}
                          className="flex rounded-md transition-all hover:bg-orange-500 items-center text-center justify-center text-xs p-2 aspect-square w-fit"
                        >
                          <FaPlusSquare />
                        </button>
                      </form>
                      : null
                      }
                    </div>
                  </div>
                )) : "... nessuna demolizione inserita"}
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

export function FormFileUploadIcon({
  targa = "",
  campo = "",
  nome,
  bucket,
  pathPrefix = "public",
  accept = "image/*,application/pdf",
  maxSizeMB = 15,
  makePublic = true,
  signedUrlSeconds = 3600,
  onchange,
  onBusyChange,
  resetToken,
  className = "",
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  if (!bucket) console.error('FormFileUploadIcon: prop "bucket" è obbligatoria.');

  const slugify = (s) =>
    String(s)
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

  const sanitizePathPrefix = (pp) => {
    if (!pp) return "";
    return String(pp)
      .split("/")
      .map((seg) => String(seg || "").trim())
      .filter(Boolean)
      .map((seg) =>
        seg
          .normalize("NFKD")
          .replace(/[^\w.\-]+/g, "-")
          .replace(/-+/g, "-")
          .toLowerCase()
      )
      .join("/");
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = "";
    onchange?.({ target: { name: nome, files: [] } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  async function handleSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // reset per poter ricaricare lo stesso file due volte di seguito
    if (inputRef.current) inputRef.current.value = "";

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File troppo grande. Max ${maxSizeMB}MB`);
      return;
    }

    setBusy(true);
    onBusyChange?.(nome, true);

    const safeTarga = slugify(targa || "no-targa");
    const safeCampo = slugify(campo || "file");
    const prefix = sanitizePathPrefix(pathPrefix);
    const base = prefix ? `${prefix}/` : "";

    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const finalPath = `${base}${safeTarga}-${safeCampo}.${ext}`;

    const { error: upErr } = await supabase.storage.from(bucket).upload(finalPath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "application/octet-stream",
    });

    if (upErr) {
      console.error("[upload] error:", upErr.message);
      toast.error(`Errore upload: ${upErr.message}`);
      setBusy(false);
      onBusyChange?.(nome, false);
      return;
    }

    let url = "";
    if (makePublic) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(finalPath);
      url = data?.publicUrl || "";
    } else {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(finalPath, parseInt(signedUrlSeconds, 10));
      if (error) console.error("[signedUrl] error:", error.message);
      url = data?.signedUrl || "";
    }

    const result = { path: finalPath, url, name: file.name, size: file.size, type: file.type };
    onchange?.({ target: { name: nome, files: [result] } });

    toast.success("File caricato ✅");
    setBusy(false);
    onBusyChange?.(nome, false);
  }

  return (
    <div className={cn("min-w-0", className)}>
      {/* INPUT NASCOSTO: niente “Scegli file” */}
      <input
        ref={inputRef}
        id={nome}
        name={nome}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      {/* ICONA CLICCABILE */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label="Carica file"
        className=""
      >
        {busy ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          <AiOutlineCloudUpload className="" />
        )}
      </button>
    </div>
  );
}
