'use client'

import { supabase } from "@/lib/supabaseClient"
import { FaFileDownload, FaCarAlt, FaCaretRight, FaTrash } from "react-icons/fa";
import { TbBrandWhatsappFilled } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { LinkComponentContact } from "@/app/gestionale/componenti/displayLinkComponentContact";
import { ButtonLinkDisplayDownloadDOC } from "@/app/gestionale/componenti/displayButtonComponentDownloadDoc";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { useState, useEffect, useRef } from "react";
import { FormSelect, FormTextarea } from "@/app/componenti/componentiForm";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AiOutlineLoading3Quarters, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai'

export default function CertificatoDemolizione ({
    tipologiaDemolizione,
    data,
    note,
    docDemolizione,
    altroDocDemolizione,
    datiV,
    uuidDemolizione,
    setRefreshKey
  }) {

  // 🔹 Stato form per UPDATE
  const [formData, setFormData] = useState({
    documentoDemolizione: "",
    altroDocumentoDemolizione: "",
    tipologiaDemolizione:"",
    noteDemolizione:"",
  })

  // 🔹 Stato per mostrare/nascondere i documenti esistenti (UI locale)
  const [docDemolizioneUrl, setDocDemolizioneUrl] = useState(docDemolizione || "")
  const [altroDocDemolizioneUrl, setAltroDocDemolizioneUrl] = useState(altroDocDemolizione || "")

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

  // Se il padre ricarica i dati, sincronizza lo stato locale
  useEffect(() => {
    setDocDemolizioneUrl(docDemolizione || "")
  }, [docDemolizione])

  useEffect(() => {
    setAltroDocDemolizioneUrl(altroDocDemolizione || "")
  }, [altroDocDemolizione])

  const [uploadingByField, setUploadingByField] = useState({});
  const [resetUploadsTick, setResetUploadsTick] = useState(0);

  // SELECT OPTION DEMOLIZIONE
  const tipologiaDemolizioneOption = [
    { label:'Totale', value:'totale' },
    { label:'Parziale', value:'parziale' }
  ]

  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const arv = datiV.azienda_ritiro_veicoli

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function handleChangeUpload(e) {
    const { name, files } = e.target || {};
    const first = Array.isArray(files) ? files[0] : undefined;
    if (!name) return;
    if (!first) {
      console.warn(`[handleChangeUpload] nessun file caricato per ${name}`);
      return;
    }

    // salvo l'URL pubblico nel campo di form
    setFormData(prev => ({ ...prev, [name]: first.url || '' }));
  }

  function handleBusyChange(nomeCampo, isBusy) {
    setUploadingByField(prev => ({ ...prev, [nomeCampo]: isBusy }));
  }

  function extractBucketAndPath(publicUrl) {
    if (!publicUrl) return null
    const marker = '/storage/v1/object/public/'
    const index = publicUrl.indexOf(marker)
    if (index === -1) return null

    const after = publicUrl.slice(index + marker.length) // "bucket/percorso/file.ext"
    const [bucket, ...rest] = after.split('/')
    const path = rest.join('/')

    return { bucket, path }
  }

  async function handleUpdate(e) {
    e.preventDefault()

    let updatedFormData = { ...formData }
    let mustResetUploads = false

    if (docDemolizione && updatedFormData.documentoDemolizione) {
      alert("Per il certificato demolizione devi prima rimuovere il documento esistente.")
      updatedFormData.documentoDemolizione = ""
      mustResetUploads = true
    }

    if (altroDocDemolizione && updatedFormData.altroDocumentoDemolizione) {
      alert("Per l'altro documento devi prima rimuovere il documento esistente.")
      updatedFormData.altroDocumentoDemolizione = ""
      mustResetUploads = true
    }

    if (mustResetUploads) {
      setFormData(updatedFormData)
      setResetUploadsTick(t => t + 1)
    }

    const rawPayload = {
      documento_demolizione: updatedFormData.documentoDemolizione,
      altro_documento_demolizione: updatedFormData.altroDocumentoDemolizione,
      tipologia_demolizione: updatedFormData.tipologiaDemolizione,
      note_demolizione: updatedFormData.noteDemolizione,
    }

    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    )

    if (Object.keys(payload).length === 0) {
      alert("Nessun campo compilato, niente da aggiornare")
      return
    }

    const { data, error } = await supabase
      .from("certificato_demolizione")
      .update(payload)
      .eq("uuid_certificato_demolizione", uuidDemolizione)
      .select()
      .single()

    if (error) {
      console.error(error)
      alert(`Errore aggiornamento: ${error.message}`)
      return
    }

    // dopo update, ripulisco i campi upload
    setFormData({
      documentoDemolizione: "",
      altroDocumentoDemolizione: "",
      noteDemolizione:"",
      tipologiaDemolizione:"",
    })
    setResetUploadsTick(t => t + 1)
    setUploadingByField({})

    console.log("Aggiornato:", data)
    alert("Demolizione aggiornata con successo!")

    setRefreshKey(k => k + 1);
  }

  async function handleRemoveDocumento(url, type, uuidVeicolo) {

    const extracted = extractBucketAndPath(url)

    if (!extracted) {
      alert("URL non valido, impossibile estrarre bucket e path")
      return
    }

    const { bucket, path } = extracted

    if (!path) {
      alert("Nessun file da cancellare")
      return
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        throw error
      }

      alert("File cancellato finalmente!")
    } catch (error) {
      console.error("Errore nel cancellare il file:", error)
      alert(`Errore nel cancellare il file: ${error.message}`)
    }

    let payload = {}

    if (type == "altro"){
      payload = { altro_documento_demolizione: null }
      setAltroDocDemolizioneUrl("")
    } else {
      payload = { documento_demolizione: null }
      setDocDemolizioneUrl("")
    }

    const { data, error } = await supabase
      .from("certificato_demolizione")
      .update(payload)
      .eq("uuid_certificato_demolizione", uuidDemolizione)
      .select()
      .single()

    if (error) {
      console.error(error)
      alert(`Errore aggiornamento: ${error.message}`)
      return
    }

    setRefreshKey(k => k + 1);

    console.log("Aggiornato:", data)

  }
  console.log("ciao")
  return (
    <>
      <div className="flex xl:flex-row flex-col min-h-0 justify-between items-start gap-3 w-full h-full">
        {/* COLONNA DATI VEICOLO / AZIENDA / DETENTORE */}
        <div className="flex flex-col w-full justify-start items-start h-full gap-1 border p-5 rounded-xl shadow-xl">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1 items-center border border-brand w-fit rounded-lg px-2">
              <FaCarAlt className="text-brand text-xs"/>
              <span className="text-base font-semibold uppercase truncate text-ellipsis">
                {datiV?.targa_veicolo_ritirato}
                <font className="text-xs text-neutral-500 font-medium italic uppercase">
                  {' '}{datiV?.vin_veicolo_ritirato}
                </font>
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-1 items-center border border-neutral-500 w-fit rounded-md px-2">
            <span className="text-xs text-neutral-400">
              Demolizione
              <font className={`font-bold uppercase ${tipologiaDemolizione == "totale" ? "text-red-600" : "text-brand"}`}>
                {' '}{tipologiaDemolizione}{' '}
              </font>
              in data
              <span className="text-xs text-neutral-400">: {data}</span>
            </span>
          </div>

          {note !== "" && (
            <div className="flex flex-row gap-1 items-center w-fit rounded-md px-2">
              <p className="text-xs text-neutral-400">
                <font className="text-red-600">Note:</font> {note}
              </p>
            </div>
          )}

          <hr className="w-full border-brand my-2"/>

          <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-3 py-1 text-xs mb-2">
            <span>DATI AZIENDA RITIRO</span>
          </div>
          <div className="flex flex-col gap-1">
            <SpanElementList icon={<FaCaretRight/>} label="Ritirato da:" data={arv?.ragione_sociale_arv}/>
            <SpanElementList icon={<FaCaretRight/>} label="Partita Iva:" data={arv?.piva_arv}/>
            <SpanElementList icon={<FaCaretRight/>} label="SDI:" data={arv?.sdi_arv}/>
            <SpanElementList icon={<FaCaretRight/>} label="Sede Legale:" data={`${arv?.indirizzo_legale_arv} - ${arv?.cap_legale_arv} ${arv?.citta_legale_arv} ${arv?.provincia_legale_arv}`}/>
            <SpanElementList icon={<FaCaretRight/>} label="Sede Operativa:" data={`${arv?.indirizzo_operativa_arv} - ${arv?.cap_operativa_arv} ${arv?.citta_operativa_arv} ${arv?.provincia_operativa_arv}`}/>
            <SpanElementList icon={<FaCaretRight/>} label="Data Ritiro Veicolo:" data={DataFormat(datiV?.created_at_veicolo_ritirato)}/>
          </div>

          <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-3 py-1 text-xs my-2">
            <span>FORMA LEGALE DETENTORE VEICOLO</span>
          </div>
          <div className="flex flex-col gap-1">
            <SpanElementList icon={<FaCaretRight/>} label="Forma Legale Detentore:" data={datiV?.forma_legale_detentore}/>
            {datiV?.forma_legale_detentore === "azienda" ? (
              <>
                <SpanElementList icon={<FaCaretRight/>} label="Ragione Sociale:" data={datiV?.ragione_sociale_detentore}/>
                <SpanElementList icon={<FaCaretRight/>} label="Partita Iva:" data={datiV?.piva_detentore}/>
              </>
            ) : (
              <SpanElementList icon={<FaCaretRight/>} label="Codice Fiscale:" data={datiV?.cf_detentore}/>
            )}
          </div>

          <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-3 py-1 text-xs my-2">
            <span>DATI DETENTORE VEICOLO</span>
          </div>
          <div className="flex flex-col gap-1">
            <SpanElementList icon={<FaCaretRight/>} label="Detentore Veicolo:" data={`${datiV?.nome_detentore} ${datiV?.cognome_detentore}`}/>
            <SpanElementList icon={<FaCaretRight/>} label="Tipologia Detentore:" data={datiV?.tipologia_detentore}/>
            <SpanElementList icon={<FaCaretRight/>} label="Nazionalità:" data={datiV?.nazionalita_documento_detentore}/>
            <SpanElementList icon={<FaCaretRight/>} label="Documento Detentore:" data={`${datiV?.tipologia_documento_detentore} n° ${datiV?.numero_documento_detentore}`}/>
            <SpanElementList icon={<FaCaretRight/>} label="Indirizzo Detentore:" data={`${datiV?.indirizzo_detentore} - ${datiV?.cap_detentore} ${datiV?.citta_detentore} ${datiV?.provincia_detentore}`}/>
          </div>

          <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-3 py-1 text-xs my-2">
            <span>DATI VEICOLO</span>
          </div>
          <div className="flex flex-col gap-1">
            <SpanElementList icon={<FaCaretRight/>} label="Modello:" data={`${datiV?.modello_veicolo.marca} ${datiV?.modello_veicolo.modello}`}/>
            <SpanElementList icon={<FaCaretRight/>} label="Documento:" data={datiV?.tipologia_documento_veicolo_ritirato}/>
            <SpanElementList icon={<FaCaretRight/>} label="Anno Immatricolazione:" data={datiV?.anno_veicolo_ritirato}/>
            <SpanElementList icon={<FaCaretRight/>} label="Cilindrata:" data={datiV?.cilindrata_veicolo_ritirato}/>
            <SpanElementList icon={<FaCaretRight/>} label="KM:" data={datiV?.km_veicolo_ritirato}/>
          </div>
        </div>

        {/* COLONNA CONTATTI / DOCUMENTI ESISTENTI */}
        <div className="flex flex-col lg:flex-1 h-full w-full lg:min-w-72 justify-start items-start gap-3 rounded-xl">
          <div className="flex flex-col gap-3 min-h-0 w-full">
            <div className="flex flex-wrap xl:flex-col flex-row gap-3 w-full">
              <div className="flex flex-col items-start justify-start border border-neutral-800 rounded-xl p-3 gap-1 shadow-xl ">
                <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-2 py-1 text-[0.6rem]">
                  <span>AZIENDA RITIRO</span>
                </div>
                <LinkComponentContact label="Mobile" icon={<TbBrandWhatsappFilled/>} info={arv?.mobile_arv} linkHref="https://wa.me/"/>
                <LinkComponentContact label="Telefono" icon={<TbBrandWhatsappFilled/>} info={arv?.telefono_arv} linkHref="https://wa.me/"/>
                <LinkComponentContact label="Email" icon={<MdEmail/>} info={arv?.email_arv} linkHref="mailto:"/>
              </div>

              <div className="flex flex-col items-start justify-start border border-neutral-800 rounded-xl p-3 gap-1 shadow-xl ">
                <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-2 py-1 text-[0.6rem]">
                  <span>DETENTORE VEICOLO</span>
                </div>
                <LinkComponentContact label="mobile detentore" icon={<TbBrandWhatsappFilled/>} info={datiV?.mobile_detentore} linkHref="https://wa.me/"/>
                <LinkComponentContact label="email detentore" icon={<MdEmail/>} info={datiV?.email_detentore} linkHref="mailto:"/>
              </div>
            </div>

            <div className="flex flex-wrap xl:flex-col flex-row gap-3 w-full">
              <div className="flex flex-col items-start justify-start border border-neutral-800 rounded-xl p-3 gap-1 shadow-xl ">
                <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-2 py-1 text-[0.6rem]">
                  <span>DOCUMENTI DETENTORE</span>
                </div>
                <ButtonLinkDisplayDownloadDOC targetType="_blank" linkHref={datiV?.foto_documento_detentore_f} info="DETENTORE F" icon={<FaFileDownload/>}/>
                <ButtonLinkDisplayDownloadDOC targetType="_blank" linkHref={datiV?.foto_documento_detentore_r} info="DETENTORE R" icon={<FaFileDownload/>}/>
              </div>

              <div className="flex flex-col items-start justify-start border border-neutral-800 rounded-xl p-3 gap-1 shadow-xl ">
                <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-2 py-1 text-[0.6rem]">
                  <span>DOCUMENTI VEICOLO</span>
                </div>
                <ButtonLinkDisplayDownloadDOC targetType="_blank" linkHref={datiV?.foto_documento_veicolo_ritirato_f} info="VEICOLO F" icon={<FaFileDownload/>}/>
                <ButtonLinkDisplayDownloadDOC targetType="_blank" linkHref={datiV?.foto_documento_veicolo_ritirato_r} info="VEICOLO R" icon={<FaFileDownload/>}/>
              </div>

              <div className="flex flex-col items-start justify-start border border-neutral-800 rounded-xl p-3 gap-1 shadow-xl ">
                <div className="flex flex-row items-center border border-brand text-neutral-300 w-fit rounded-lg px-2 py-1 text-[0.6rem]">
                  <span>DOCUMENTI DEMOLIZIONE</span>
                </div>

                {/* Documento principale */}
                {docDemolizioneUrl && (
                  <div className="flex flex-row items-center gap-2">
                    <ButtonLinkDisplayDownloadDOC
                      targetType="_blank"
                      linkHref={docDemolizioneUrl}
                      info="DEMOLIZIONE"
                      icon={<FaFileDownload/>}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDocumento(docDemolizioneUrl, 'demolizione')}
                      className="text-[0.65rem] px-2 py-1 rounded bg-red-900 text-white hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}

                {/* Altro documento */}
                {altroDocDemolizioneUrl && (
                  <div className="flex flex-row items-center gap-2">
                    <ButtonLinkDisplayDownloadDOC
                      targetType="_blank"
                      linkHref={altroDocDemolizioneUrl}
                      info="ALTRO"
                      icon={<FaFileDownload/>}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDocumento(altroDocDemolizioneUrl, 'altro')}
                      className="text-[0.65rem] px-2 py-1 rounded bg-red-900 text-white hover:bg-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLONNA FORM UPDATE */}
        <div className="flex flex-col w-full h-full shadow-xl p-3 gap-3 border border-red-900 rounded-xl">
          <div className="flex flex-row gap-1 items-center border border-red-900 text-neutral-300 w-fit rounded-lg px-3 py-1 text-xs">
            <span>AGGIORNA</span>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col h-full gap-2">

            <FormSelect
              nome="tipologiaDemolizione"
              label="Tipologia Demolizione"
              value={formData.tipologiaDemolizione}
              onchange={handleChange}
              options={tipologiaDemolizioneOption}
            />
            <FormTextarea
              nome="noteDemolizione"
              label="Note"
              value={formData.noteDemolizione}
              colspan="col-span-6"
              mdcolspan="lg:col-span-12"
              onchange={handleChange}
              type="textarea"
            />
            <FormFileUpload
              nome="documentoDemolizione"
              label="Certificato Demolizione"
              bucket="documentiveicoli"
              accept="image/*,application/pdf"
              campo="demolizione"
              colspan="col-span-12"
              mdcolspan="lg:col-span-6"
              targa={datiV?.targa_veicolo_ritirato}
              makePublic={true}
              onchange={handleChangeUpload}
              onBusyChange={handleBusyChange}
              resetToken={resetUploadsTick}
              pathPrefix={`public/${arv?.uuid_azienda_ritiro_veicoli}/${datiV?.targa_veicolo_ritirato}`}
            />
            <FormFileUpload
              nome="altroDocumentoDemolizione"
              label="Altro Documento"
              bucket="documentiveicoli"
              accept="image/*,application/pdf"
              campo="altro"
              colspan="col-span-12"
              mdcolspan="lg:col-span-6"
              targa={datiV?.targa_veicolo_ritirato}
              makePublic={true}
              onchange={handleChangeUpload}
              onBusyChange={handleBusyChange}
              resetToken={resetUploadsTick}
              pathPrefix={`public/${arv?.uuid_azienda_ritiro_veicoli}/${datiV?.targa_veicolo_ritirato}`}
            />

            <button
              type="submit"
              disabled={anyUploading}
              className="bg-red-900 mt-2 text-white px-6 py-1 text-xs rounded-lg font-semibold transition disabled:opacity-60 lg:w-fit w-full h-8"
            >
              {anyUploading
                ? "Caricamento in corso..."
                : (
                  <span className="flex flex-row items-center gap-1">
                    <HiMiniPencilSquare/> Modifica
                  </span>
                )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export function SpanElementList ({icon, label, data}) {
  return(
    <div className="flex flex-row border rounded-md p-1 px-3 gap-1 items-center justify-start text-sm text-neutral-400">
      <div className="text-brand">{icon}</div>
      <span className="">{label}</span>
      <span className="dark:text-neutral-300 font-bold">{data}</span>
    </div>
  )
}

export function FormFileUpload({
  targa = '',
  campo = '',
  nome,
  label,
  bucket,
  pathPrefix = 'public',
  accept = '',
  multiple = false,
  maxSizeMB = 15,
  makePublic = true,
  signedUrlSeconds = 3600,
  onchange,
  onBusyChange,
  helpText = '',
  resetToken,
}) {
  const [queue, setQueue] = useState([]);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  if (!bucket) console.error('FormFileUpload: prop "bucket" è obbligatoria.');

  const bytesToMB = (b) => (b / (1024 * 1024)).toFixed(2);
  const slugify = (s) =>
    String(s).normalize('NFKD').replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').toLowerCase();

  const sanitizePathPrefix = (pp) => {
    if (!pp) return '';
    return String(pp)
      .split('/')
      .map(seg => String(seg || '').trim())
      .filter(seg => seg.length > 0)
      .map(seg =>
        seg.normalize('NFKD')
          .replace(/[^\w.\-]+/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase()
      )
      .join('/');
  };

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [previews]);

  useEffect(() => {
    previews.forEach(p => URL.revokeObjectURL(p.url));
    setQueue([]);
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = "";
    onchange?.({ target: { name: nome, files: [] } });
  }, [resetToken]);

  async function bucketExists(name) {
    const { error } = await supabase.storage.from(name).list('', { limit: 1 });
    if (error) {
      console.error(`[bucketExists] "${name}" non accessibile:`, error.message);
      return false;
    }
    return true;
  }

  async function uploadOne(file, idx, finalPath) {
    try {
      setQueue(q => q.map((it, i) => (i === idx ? { ...it, status: 'uploading' } : it)));

      const { error: upErr } = await supabase
        .storage
        .from(bucket)
        .upload(finalPath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (upErr) {
        console.error('[uploadOne] storage.upload error:', upErr.message);
        setQueue(q => q.map((it, i) => (i === idx ? { ...it, status: 'error', err: upErr } : it)));
        return null;
      }

      let url = '';
      if (makePublic) {
        const { data: pub, error: pubErr } = supabase.storage.from(bucket).getPublicUrl(finalPath);
        if (pubErr) {
          console.warn('[uploadOne] getPublicUrl warning:', pubErr.message);
        }
        url = pub?.publicUrl || '';
      } else {
        const { data: signed, error: sErr } =
          await supabase.storage.from(bucket).createSignedUrl(finalPath, parseInt(signedUrlSeconds, 10));
        if (sErr) {
          console.error('[uploadOne] createSignedUrl error:', sErr?.message || sErr);
        } else {
          url = signed?.signedUrl || '';
        }
      }

      setQueue(q => q.map((it, i) => (i === idx ? { ...it, status: 'done', path: finalPath, url } : it)));
      return { path: finalPath, url, name: file.name, size: file.size, type: file.type };
    } catch (e) {
      console.error('[uploadOne] catch:', e);
      setQueue(q => q.map((it, i) => (i === idx ? { ...it, status: 'error', err: e } : it)));
      return null;
    }
  }

  async function handleFilesSelected(e) {
    const list = e.target.files || [];
    const files = Array.from(list);
    if (!files.length) return;

    onBusyChange?.(nome, true);

    const ok = await bucketExists(bucket);
    if (!ok) {
      onBusyChange?.(nome, false);
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    const initial = files.map(f => ({
      file: f,
      tooBig: f.size > maxBytes,
      status: f.size > maxBytes ? 'error' : 'pending',
    }));

    setPreviews(prev => {
      prev.forEach(p => URL.revokeObjectURL(p.url));
      return files
        .filter(f => f.type?.startsWith('image/'))
        .map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    });
    setQueue(initial);

    const today = new Date();
    const date = `${String(today.getDate()).padStart(2,'0')}${String(
      today.getMonth() + 1
    ).padStart(2,'0')}${today.getFullYear()}`;
    const safeTarga = slugify(targa || 'no-targa');
    const safeCampo = slugify(campo || 'file');

    const prefix = sanitizePathPrefix(pathPrefix);
    const base = prefix ? `${prefix}/` : '';

    const uploadedResults = [];
    for (let i = 0; i < initial.length; i++) {
      const it = initial[i];
      if (it.tooBig) {
        console.warn(`[upload] "${it.file.name}" supera ${maxBytes / (1024*1024)}MB`);
        continue;
      }
      const ext = (it.file.name.split('.').pop() || 'jpg').toLowerCase();
      const finalPath = `${base}${safeTarga}-${safeCampo}.${ext}`;
      console.log(`📤 Upload → bucket=${bucket}, path=${finalPath}`);

      const res = await uploadOne(it.file, i, finalPath);
      if (res) uploadedResults.push(res);
    }

    console.log('[FormFileUpload] uploaded ->', { nome, uploaded: uploadedResults });
    onchange?.({ target: { name: nome, files: uploadedResults } });

    onBusyChange?.(nome, false);
  }

  return (
    <div className="min-w-0">
      <Label htmlFor={nome}>{label}</Label>

      <Input
        ref={inputRef}
        id={nome}
        name={nome}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFilesSelected}
        className="
          w-full min-w-0
          file:mr-3 file:rounded-lg file:border file:px-3 file:py-1 file:text-xs
          file:bg-brand file:text-white file:border-brand
          hover:file:opacity-90
          focus:outline-none
          focus-visible:ring-2 focus-visible:ring-brand
          focus-visible:ring-offset-2
        "
      />

      {helpText && <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
      <p className="mt-1 text-[0.65rem] text-neutral-500">
        Max {maxSizeMB} MB per file{multiple ? ' (no. multipli consentiti)' : ''}
      </p>

      {queue.length > 0 && (
        <div className="mt-3 space-y-2">
          {queue.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{item.file.name}</div>
                <div className="text-xs text-neutral-500">
                  {bytesToMB(item.file.size)} MB • {item.file.type || 'file'}
                </div>
              </div>
              <div className="ml-3 w-28 flex items-center justify-end">
                {item.status === 'pending'   && <span className="text-xs">in coda…</span>}
                {item.status === 'uploading' && (
                  <div className="flex items-center gap-1 text-xs">
                    <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                    <span>carico…</span>
                  </div>
                )}
                {item.status === 'done'      && (
                  <div className="flex items-center gap-1 text-green-600">
                    <AiOutlineCheck className="h-4 w-4" />
                    <span>ok</span>
                  </div>
                )}
                {item.status === 'error'     && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AiOutlineClose className="h-4 w-4" />
                    <span>errore</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {previews.map((p, i) => (
            <div key={i} className="w-36 border rounded-lg p-2 bg-neutral-50 dark:bg-neutral-900">
              <div className="aspect-video overflow-hidden rounded">
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="mt-1 truncate text-[0.7rem]">{p.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}