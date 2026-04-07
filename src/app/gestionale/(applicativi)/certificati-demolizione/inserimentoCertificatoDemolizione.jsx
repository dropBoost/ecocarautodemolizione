'use client'
import { useEffect, useMemo, useState, useRef } from 'react'
import comuni from "@/app/componenti/comuni.json"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FaPlusSquare } from "react-icons/fa";
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AiOutlineLoading3Quarters, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai'

export default function InserimentoCertificatiDemolizione({onDisplay, statusAziende, setStatusAziende}) {
  const dataOggi = new Date().toISOString().split("T")[0]

  // VARIABILI GESTIONE INSERIMENTO INDIRIZZO LEGALE
  const [praticheRitiroVeicoli, setPraticheRitiroVeicoli] = useState([])
  const [praticaSelect, setPraticaSelect] = useState("")

  const [open, setOpen] = useState(false)

  const [statusPratiche, setStatusPratiche] = useState(false)
  const [uploadingByField, setUploadingByField] = useState({});
  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const [resetUploadsTick, setResetUploadsTick] = useState(0);
  const [targaCaricare, setTargaCaricare] = useState(false)
  const [telaioCaricare, setTelaioCaricare] = useState(false)
  const [fourStep, setFourStep] = useState(false)
  
  const [formData, setFormData] = useState({
    uuidVeicoloRitirato:"",
    documentoDemolizione:"",
    altroDocumentoDemolizione:"",
    demolizioneCompletata:false,
    noteDemolizione:"",
  })


  // CARICAMENTO PRATICHE RITIRO VEICOLO
  useEffect(() => {
    ;(async () => {
      const { data: praticheData, error } = await supabase
        .from("dati_veicolo_ritirato")
        .select(`*,
            aziendaRitiro:azienda_ritiro_veicoli(
            ragione_sociale_arv,provincia_legale_arv)`)
        .eq("pratica_completata", false)
        .eq("veicolo_consegnato", true)
        .eq("demolizione_approvata", true)
        .eq("veicolo_ritirato", true)
        .order("created_at_veicolo_ritirato", { ascending: false })
        

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento delle pratiche ritiro veicoli")
        return
      }
      setPraticheRitiroVeicoli(praticheData ?? [])
    })()
  }, [statusPratiche])

  // OPTION PRATICHE DI RITIRO
  const optionsPraticheRitiro = (praticheRitiroVeicoli ?? []).map((prv) => ({
    value: prv.uuid_veicolo_ritirato,
    label: `${prv.targa_veicolo_ritirato} / ${prv.aziendaRitiro?.ragione_sociale_arv} - ${prv.aziendaRitiro?.provincia_legale_arv}`,
    search: `${prv.targa_veicolo_ritirato ?? ""}`,
  }))

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

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function handleChangeUpload(e) {
    const { name, files } = e.target || {};
    const first = Array.isArray(files) ? files[0] : undefined;
    if (!name) return;
    if (!first) {
      console.warn(`[handleChangeUpload] nessun file caricato per ${name}`);
      return;
    }
    // salva il path nel campo giusto (es. fronteDOCveicolo, retroDOCdetentore, …)
    setFormData(prev => ({ ...prev, [name]: first.url || '' }));
  }

  function handleBusyChange(nomeCampo, isBusy) {
    setUploadingByField(prev => ({ ...prev, [nomeCampo]: isBusy }));
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
        uuid_veicolo_ritirato: praticaSelect,
        documento_demolizione: formData.documentoDemolizione,
        altro_documento_demolizione: formData.altroDocumentoDemolizione,
        tipologia_demolizione: "totale",
        demolizione_completata: true,
        note_demolizione: formData.noteDemolizione
    }

    if (targaCaricare === true){
      alert("Targa Già inserita")
    } else if (telaioCaricare === true){
      alert("Telaio Già inserito")
    } else {

      const { data, error } = await supabase.from("certificato_demolizione").insert(payload).select().single()
      if (error) {
        console.error(error)
        alert(`Errore salvataggio: ${error.message}`)
        return
      } else {
        setFormData({
        uuidVeicoloRitirato:"",
        documentoDemolizione:"",
        altroDocumentoDemolizione:"",
        demolizioneCompletata:false,
        noteDemolizione:"",
        })
    
        await StatusUpdate(praticaSelect, "ce62b302-fb4e-4f2c-9e2f-cb230b40275b") //DEMOLITO

        setResetUploadsTick(t => t + 1)
        setUploadingByField({});
        setStatusAziende(prev => !prev)
      }

      console.log("Inserito:", data)
      alert("Demolizione Inserita con successo!")
      
      const { dataCompletato, errorCompletato } = await supabase.from("dati_veicolo_ritirato").update({pratica_completata: true}).eq("uuid_veicolo_ritirato", praticaSelect).select().single()

      if (errorCompletato) {
        console.error("Errore aggiornando pratica_completata:", errorCompletato)
        alert(`Errore aggiornando pratica_completata: ${errorCompletato.message}`)
      } else {
        console.log("Pratica segnata come completata:", dataCompletato)
        setStatusPratiche(prev => !prev)
        setPraticaSelect("")
      }

    }
  }

  useEffect(() => {

    const data = new Date("2025-11-02");
    const annoCorrente = data.getFullYear();

    const fd = formData ?? {};

    const compilato = (v) =>
      typeof v === "string" ? v?.trim() !== "" : v !== null && v !== undefined;

    const fourOk =
    compilato(fd.documentoDemolizione);  


    setFourStep(fourOk);
  }, [formData, setFourStep]);

  const datiPraticaSelezionata = praticheRitiroVeicoli.find(p => p.uuid_veicolo_ritirato == praticaSelect)

  return (
    <>
      <div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full flex-1 flex flex-col md:p-0 md:pe-3 px-4`}>
				<form onSubmit={handleSubmit} className="grid h-full grid-cols-12 gap-4">
					<div id="oneStep" className='flex flex-col col-span-12 h-fit gap-3'>  
						<div className="col-span-12 flex flex-row justify-between">
								<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">AZIENDA RITIRO VEICOLO</h4>
								<button
								type="submit"
								disabled={anyUploading}
								className={`${fourStep ? "" : "hidden"} bg-brand px-3 py-2 w-fit rounded-xl h-full`}>
									{anyUploading ? "Caricamento in corso..." : <FaPlusSquare className='font-bold text-dark dark:text-white'/>}
								</button>
						</div>
						<div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl shadow-lg min-w-0 h-full bg-brand/50'>
							{/* SELECT DI RICERCA PRATICA */}
							<div className="col-span-12 lg:col-span-12 min-w-0">
								<label className="block text-sm font-semibold mb-1">Seleziona una pratica</label>
								<Popover open={open} onOpenChange={setOpen} className="w-full">
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={open}
											className="w-full min-w-0 justify-between outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2">
											{praticaSelect ? optionsPraticheRitiro.find((ar) => ar.value === praticaSelect)?.label  : "seleziona una pratica..."}
											<ChevronsUpDown className="opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent align="start" sideOffset={4} className="p-0 w-[var(--radix-popover-trigger-width)]">
										<Command className="p-1">
											<CommandInput placeholder="Cerca..." className="h-8 focus:ring-1 focus:ring-brand focus:border-brand outline-none focus:outline-none my-2" />
											<CommandList className="my-1">
												<CommandEmpty>Nessun risultato</CommandEmpty>
												<CommandGroup>
													{optionsPraticheRitiro.map((opt) => (
                            <CommandItem
                              key={opt.value}
                              value={opt.search}
                              onSelect={() => {
                                setPraticaSelect(opt.value)
                                setOpen(false)
                              }}
                            >
                              {opt.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  praticaSelect === opt.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>


						</div>
					</div>
					<div id="twoStep" className={`${praticaSelect ? "" : "hidden"} flex flex-col col-span-12 h-fit gap-3`}>             
						<div className="col-span-12">
							<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">SPECIFICHE VEICOLO</h4>
						</div>
						<div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl dark:shadow-lg min-w-0 bg-white dark:bg-neutral-900 border'>
							<FormTextarea nome="noteDemolizione" label='Note' value={formData.noteDemolizione} colspan="col-span-6" mdcolspan="lg:col-span-12" onchange={handleChange} type="textarea" as="textarea"/>
						</div>
					</div>

					<div id="threeStep" className={`${praticaSelect ? "" : "hidden"} flex flex-col col-span-12 h-fit gap-3`}>              
						<div className={"col-span-12"}>
							<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">FOTO</h4>
						</div>
						<div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl dark:shadow-lg min-w-0 bg-white dark:bg-neutral-900 border'>
							<FormFileUpload
								nome="documentoDemolizione"
								label="Certificato Demolizione"
								bucket="documentiveicoli"
								accept="image/*,application/pdf"
								campo="demolizione"
								colspan="col-span-12"
								mdcolspan="lg:col-span-6"
								targa={datiPraticaSelezionata?.targa_veicolo_ritirato}
								makePublic={true}
								onchange={handleChangeUpload}
								onBusyChange={handleBusyChange}
								resetToken={resetUploadsTick}
								pathPrefix={`public/${datiPraticaSelezionata?.uuid_azienda_ritiro_veicoli}/${datiPraticaSelezionata?.targa_veicolo_ritirato}`}
							/>
							<FormFileUpload
								nome="altroDocumentoDemolizione"
								label="Radiazione PRA"
								bucket="documentiveicoli"
								accept="image/*,application/pdf"
								campo="radiazionePRA"
								colspan="col-span-12"
								mdcolspan="lg:col-span-6"
								targa={datiPraticaSelezionata?.targa_veicolo_ritirato}
								makePublic={true}
								onchange={handleChangeUpload}
								onBusyChange={handleBusyChange}
								resetToken={resetUploadsTick}
								pathPrefix={`public/${datiPraticaSelezionata?.uuid_azienda_ritiro_veicoli}/${datiPraticaSelezionata?.targa_veicolo_ritirato}`}
							/>
						</div>              
					</div>  

					<div id="fourStep" className={`${fourStep ? "" : "hidden"} col-span-12 flex justify-end`}>
						<button
							type="submit"
							disabled={anyUploading}
							className="border border-brand hover:bg-brand text-neutral-600 dark:text-neutral-200 px-6 py-1 text-xs rounded-xl font-semibold transition disabled:opacity-60 lg:w-fit w-full h-8">
							{anyUploading ? "Caricamento in corso..." : "Inserisci"}
						</button>
					</div>
				</form>
      </div>
    </>
  )
}

export function FormField ({colspan, mdcolspan, nome,label, value, onchange, type, status}) {
  return (
    <div className={`${colspan} ${mdcolspan} min-w-0 ${status} `}>
      <Label htmlFor={nome}>{label}</Label>
      <Input
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value}
        onChange={onchange}
        
        className={`w-full min-w-0 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand`}
      />
    </div>
  )
}

export function FormTextarea ({colspan, mdcolspan, nome,label, value, onchange, type, status}) {
  return (
    <div className={`${colspan} ${mdcolspan} min-w-0 ${status} `}>
      <Label htmlFor={nome}>{label}</Label>
      <Textarea
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value}
        onChange={onchange}
        
        className={`w-full min-w-0 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand`}
      />
    </div>
  )
}

export function FormSelect({ colspan, mdcolspan, nome, label, value, onchange, options = [] }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } })
  }
  return (
    <div className={`${colspan} ${mdcolspan} min-w-0`}>
      <label className="block text-sm font-semibold mb-1" htmlFor={nome}>{label}</label>
      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className=" rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt, idx) => (
              <SelectItem key={idx} value={String(opt)} className="data-[state=checked]:bg-brand data-[state=checked]:text-foreground focus:bg-brand">
                {String(opt)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  )
}

export function FormCheckBox({ colspan, mdcolspan, nome, label, value, onchange }) {
  return (
    <div className={`${colspan} ${mdcolspan} min-w-0 flex flex-col md:flex-col items-start md:items-start justify-between gap-2`}>
      <Label htmlFor={nome}>{label}</Label>
      <div className="flex justify-start items-center h-full w-full">
        <Checkbox
          id={nome}
          checked={!!value}
          onCheckedChange={(checked) => {
            const bool = checked === true
            onchange?.({ target: { name: nome, checked: bool } })
          }}
          className="h-4 w-4 shrink-0 rounded border border-gray-400 data-[state=checked]:bg-brand data-[state=checked]:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <input type="hidden" name={nome} value={value ? 'true' : 'false'} />
    </div>
  )
}

export function FormSelectRuoli({ colspan, mdcolspan, nome, label, value, onchange, options = [] }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } })
  }
  return (
    <div className={`${colspan ?? ""} ${mdcolspan ?? ""} min-w-0`}>
      <label className="block text-sm font-semibold mb-1" htmlFor={nome}>{label}</label>
      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="data-[state=checked]:bg-brand data-[state=checked]:text-foreground focus:bg-brand">
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  )
}

export function FormFileUpload({
  targa = '',
  colspan,
  mdcolspan,
  campo = '',
  nome,
  label,
  bucket,
  pathPrefix = 'public',      // usa "public" di default per rispettare le policy di read
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
  const [queue, setQueue] = useState([]);      // solo per UI: [{file, status, path?, url?, err?, tooBig?}]
  const [previews, setPreviews] = useState([]); // preview locali
  const inputRef = useRef(null);   // <-- ref all'input
  
  if (!bucket) console.error('FormFileUpload: prop "bucket" è obbligatoria.');

  const bytesToMB = (b) => (b / (1024 * 1024)).toFixed(2);
  const slugify = (s) =>
    String(s).normalize('NFKD').replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').toLowerCase();

  const sanitizePathPrefix = (pp) => {
    if (!pp) return '';
    return String(pp)
      .split('/')                  // supporta "azienda/targa" o più livelli
      .map(seg => String(seg || '').trim())
      .filter(seg => seg.length > 0)       // niente vuoti / "undefined"
      .map(seg =>
        seg.normalize('NFKD')
           .replace(/[^\w.\-]+/g, '-')     // solo lettere/numeri/_ . -
           .replace(/-+/g, '-')
           .toLowerCase()
      )
      .join('/');                  // ricompone con uno slash singolo tra i segmenti
  };

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url));
  }, [previews]);

  useEffect(() => {
    // quando il parent incrementa resetToken:
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
          upsert: true, // metti false se NON vuoi sovrascrivere
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

    // --- NEW: usa il pathPrefix SANITIZZATO, senza slash iniziale/finale ---
    const prefix = sanitizePathPrefix(pathPrefix);          // <--- nuovo
    const base = prefix ? `${prefix}/` : '';                // <--- nuovo
    // -----------------------------------------------------------------------

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
    <div className={cn(colspan ?? '', mdcolspan ?? '', 'min-w-0')}>
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

