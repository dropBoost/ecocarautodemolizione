'use client'
import { useEffect, useState } from "react"
import comuni from "@/app/componenti/comuni.json"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FaPlusSquare } from "react-icons/fa";

export default function InserimentoAzienda({onDisplay, setStatusAziende}) {

  const dataOggi = new Date().toISOString().split("T")[0]

  //VARIABILI GESTIONE INSERIMENTO INDIRIZZO LEGALE
  const [provinciaLegale, setProvinciaLegale] = useState([])
  const [cittaLegale, setCittaLegale] = useState([])
  const [capLegale, setCapLegale] = useState([])
  const [cittaSelezionataLegale, setCittaSelezionataLegale] = useState([])

  //VARIABILI GESTIONE INSERIMENTO INDIRIZZO OPERATIVO
  const [provinciaOperativa, setProvinciaOperativa] = useState([])
  const [cittaOperativa, setCittaOperativa] = useState([])
  const [capOperativa, setCapOperativa] = useState([])
  const [cittaSelezionataOperativa, setCittaSelezionataOperativa] = useState([])
  const [uploadingByField, setUploadingByField] = useState({});
  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const [ruoliUtente, setRuoliUtente] = useState([])
  const [ruoloSelezionato, setRuoloSelezionato] = useState([])
  const [aziendaInserimento, setAziendaInserimento] = useState(true)

  const [formData, setFormData] = useState({
    ragioneSociale: "",
    capLegale:"",
    sdi:"",
    provinciaLegale: "",
    cittaLegale: "",
    capLegale:"",
    indirizzoLegale:"",
    provinciaOperativa: "",
    cittaOperativa: "",
    capOperativa:"",
    indirizzoOperativa:"",
    email: "",
    telefono: "",
    mobile: "",
    rules:"",
    piva:"",
    password:"",
    attiva: false,
  })
  
  const province = comuni.flatMap(c => c.sigla)
  const provinceSet = [...new Set(province)].sort()

  //CARICAMENTO RUOLI//

  useEffect(() => {
    ;(async () => {
      const { data: ruoliData, error } = await supabase
        .from("rules_user")
        .select("*")
        .order("alias_rules", { ascending: false })

      if (error) {
        console.error(error)
        toast.error("Errore nel caricamento personal Trainer")
        return
      }
      setRuoliUtente(ruoliData ?? [])
    })()
  }, [])

  const optionsRuoliUtente = [{
    value:"0f94ac5a-f7c0-4c27-a1c7-bdbc7c057e03",
    label:`company`,
  }]

  //FINE CARICAMENTO RUOLI

  //DATI SEDE LEGALE//

  useEffect(() => {

    const cittaFiltrata = comuni
    .filter(c => c.sigla === provinciaLegale)  
    .map(c => c.nome)                     
    .sort((a, b) => a.localeCompare(b))  

    setCittaLegale(cittaFiltrata)
  }, [provinciaLegale])

  useEffect(() => {

    const capFiltrati = comuni
    .filter(c => c.nome === cittaSelezionataLegale)  
    .flatMap(c => c.cap)                   
    .sort((a, b) => a.localeCompare(b))  

    setCapLegale(capFiltrati)
  }, [cittaSelezionataLegale])

  function handleChangeProvinciaLegale(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setProvinciaLegale(value)
  }

  function handleChangeCittaLegale(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCittaSelezionataLegale(value)
  }

  function handleChangeCapLegale(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCapLegale([value])
  }

  //FINE DATI SEDE LEGALE

  //DATI SEDE OPERATIVA//

  useEffect(() => {

    const cittaFiltrata = comuni
    .filter(c => c.sigla === provinciaOperativa)  
    .map(c => c.nome)                     
    .sort((a, b) => a.localeCompare(b))  

    setCittaOperativa(cittaFiltrata)
  }, [provinciaOperativa])

  useEffect(() => {

    const capFiltrati = comuni
    .filter(c => c.nome === cittaSelezionataOperativa)  
    .flatMap(c => c.cap)                   
    .sort((a, b) => a.localeCompare(b))  

    setCapOperativa(capFiltrati)
  }, [cittaSelezionataOperativa])

  function handleChangeProvinciaOperativa(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setProvinciaOperativa(value)
  }

  function handleChangeCittaOperativa(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCittaSelezionataOperativa(value)
  }

  function handleChangeCapOperativa(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setCapOperativa([value])
  }

  //FINE DATI SEDE OPERATIVA

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  function handleRuoli(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setRuoloSelezionato("company")
  } 
  function handleChangeNumerico(e) {
    const { name, value } = e.target
    const digitsOnly = value.trim().replace(/\D/g, "")
    setFormData(prev => ({ ...prev, [name]: digitsOnly }))
  }
  function handleChangePiva(e) {
    const { name, value } = e.target
    const digitsOnly = value.trim().replace(/\D/g, "").slice(0, 11).toUpperCase()
    setFormData(prev => ({ ...prev, [name]: digitsOnly }))
  }
  function handleChangeRagioneSociale(e) {
    const { name, value } = e.target
    value.toUpperCase()
    setFormData({ ...formData, [name]: value.toUpperCase() })
  }
  function handleChangeCheckbox(e) {
  const { name, checked } = e.target
  setFormData(prev => ({ ...prev, [name]: checked }))
  }

  useEffect(() => {
    const fetchData = async () => {
      const piva = (formData.piva || "").replace(/\D/g, "").slice(0, 11) // normalizza

      const { count, error } = await supabase
        .from("azienda_ritiro_veicoli")
        .select("piva_arv", { head: true, count: "exact" })
        .eq("piva_arv", piva)

      if (error) {
        console.error(error)
        return
      }

      if (count > 0) {
        setAziendaInserimento(false)
        console.log("P.IVA già registrata")
      } else {
        setAziendaInserimento(true)
      }
    }

    fetchData()
  }, [formData.piva])

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      uuid_rules: formData.rules || null,
      ragione_sociale_arv: formData.ragioneSociale || null,
      piva_arv: formData.piva || null,
      sdi_arv: formData.sdi,
      cap_legale_arv: formData.capLegale,
      citta_legale_arv: formData.cittaLegale || null,
      provincia_legale_arv: formData.provinciaLegale || null,
      indirizzo_legale_arv: formData.indirizzoLegale || null,
      cap_operativa_arv: formData.capOperativa,
      citta_operativa_arv: formData.cittaOperativa || null,
      provincia_operativa_arv: formData.provinciaOperativa || null,
      indirizzo_operativa_arv: formData.indirizzoOperativa || null,
      mobile_arv: formData.mobile || null,
      email_arv: formData.email || null,
      telefono_arv: formData.telefono || null,
      attiva_arv: formData.attiva,
      uuid_azienda_ritiro_veicoli: null,
    }

    // VALIDAZIONI
    if (
      formData.rules === "" ||
      formData.ragioneSociale === "" ||
      formData.piva === "" ||
      formData.email === ""
    ) {
      alert("Campi Vuoti")
      return
    } else if (formData.piva.length !== 11) {
      alert("Partita IVA Non corretta")
      return
    } else if (!aziendaInserimento) {
      alert("Partita IVA già inserita")
      return
    } else if (!formData.password || formData.password.length < 6) {
      alert("La password deve avere almeno 6 caratteri")
      return
    }

    // INSERIMENTO UTENTE AUTENTICATO
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        phone: formData.mobile,
        password: formData.password,
        options: {
          data: {
            display_name: formData.ragioneSociale,
            ragione_sociale: formData.ragioneSociale,
            piva: formData.piva,
            mobile: formData.mobile,
            ruolo: ruoloSelezionato
          },
        },
      })

      if (authError) {
        console.error("Errore signUp auth:", authError)
        alert(`Errore registrazione utente: ${authError.message}`)
        return
      }

      
      const authUserId = authData?.user?.id || null
      payload.uuid_azienda_ritiro_veicoli = authUserId

      // 2️⃣ INSERIMENTO AZIENDA NELLA TABELLA
      const { data, error } = await supabase
        .from("azienda_ritiro_veicoli")
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error(error)
        alert(`Errore salvataggio azienda: ${error.message}`)
        return
      }

      // 3️⃣ RESET FORM
      setFormData({
        ragioneSociale: "",
        capLegale: "",
        sdi: "",
        provinciaLegale: "",
        cittaLegale: "",
        indirizzoLegale: "",
        capOperativa: "",
        provinciaOperativa: "",
        cittaOperativa: "",
        indirizzoOperativa: "",
        email: "",
        telefono: "",
        mobile: "",
        rules: "",
        piva: "",
        attiva: false,
        password: "",
      })

      setStatusAziende(prev => !prev)

      console.log("Inserito:", data)
      alert("Azienda e utente inseriti con successo!")
    } catch (err) {
      console.error("Errore imprevisto:", err)
      alert("Si è verificato un errore imprevisto")
    }
  }

  //FINE INSERIMENTO UTENTE //

  return (
    <>
    <div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full`}>
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
        <div className="col-span-12 flex flex-row justify-between">
            <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">DATI AZIENDA</h4>
            <button
            type="submit"
            disabled={anyUploading}
            className=' bg-brand px-3 py-2 w-fit rounded-xl h-full'>
              {anyUploading ? "Caricamento in corso..." : <FaPlusSquare className='font-bold text-white'/>}
            </button>
        </div>
        <div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl min-w-0 h-full bg-neutral-300 dark:bg-neutral-950/40'>
          <FormField nome="ragioneSociale" label='Ragione Sociale' value={formData.ragioneSociale} colspan="col-span-12" mdcolspan="lg:col-span-4" onchange={handleChangeRagioneSociale} type='text'/>
          <FormField nome="piva" label='Partita Iva' value={formData.piva} colspan="col-span-6" mdcolspan="lg:col-span-2" onchange={handleChangePiva} type='text'/>
          <FormField nome="sdi" label='SDI' value={formData.sdiArv} colspan="col-span-6" mdcolspan="lg:col-span-2" onchange={handleChange} type='text'/>
          <FormSelectRuoli nome="rules" label='Ruolo' value={formData.rules} colspan="col-span-10" mdcolspan="lg:col-span-3" onchange={handleRuoli} options={optionsRuoliUtente}/>
          <FormCheckBox nome="attiva" label='Attiva' value={formData.attiva} colspan="col-span-2" mdcolspan="md:col-span-1 lg:col-span-1" onchange={handleChangeCheckbox} type='checkbox'/>
        </div>
        <div className="col-span-12">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">SEDE LEGALE</h4>
        </div>
        <div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl min-w-0 h-full border bg-white dark:bg-neutral-900'>
          <FormSelect nome="provinciaLegale" label='Provincia' value={formData.provinciaLegale} colspan="col-span-3" mdcolspan="lg:col-span-2" onchange={handleChangeProvinciaLegale} options={provinceSet}/>
          <FormSelect nome="cittaLegale" label='Città' value={formData.cittaLegale} colspan="col-span-5" mdcolspan="lg:col-span-2" onchange={handleChangeCittaLegale} options={cittaLegale}/>
          <FormSelect nome="capLegale" label='Cap' value={formData.capLegale} colspan="col-span-4" mdcolspan="lg:col-span-2" onchange={handleChangeCapLegale} options={capLegale}/>
          <FormField nome="indirizzoLegale" label='Indirizzo' value={formData.indirizzoLegale} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChange} type='text'/>
        </div>
        <div className="col-span-12">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">SEDE OPERATIVA</h4>
        </div>
        <div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl min-w-0 h-full border bg-white dark:bg-neutral-900'>
        <FormSelect nome="provinciaOperativa" label='Provincia' value={formData.provinciaOperativa} colspan="col-span-3" mdcolspan="lg:col-span-2" onchange={handleChangeProvinciaOperativa} options={provinceSet}/>
        <FormSelect nome="cittaOperativa" label='Città' value={formData.cittaOperativa} colspan="col-span-5" mdcolspan="lg:col-span-2" onchange={handleChangeCittaOperativa} options={cittaOperativa}/>
        <FormSelect nome="capOperativa" label='Cap' value={formData.capOperativa} colspan="col-span-4" mdcolspan="lg:col-span-2" onchange={handleChangeCapOperativa} options={capOperativa}/>
        <FormField nome="indirizzoOperativa" label='Indirizzo' value={formData.indirizzoOperativa} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChange} type='text'/>
        </div>
        <div className="col-span-12">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">CONTATTI</h4>
        </div>
        <div className='grid grid-cols-12 gap-4 p-6 col-span-12 rounded-2xl min-w-0 h-full border bg-white dark:bg-neutral-900'>
        <FormField nome="email" label='Email' value={formData.email} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChange} type='email'/>
        <FormField nome="telefono" label='Telefono' value={formData.telefono} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChangeNumerico} type='tel'/>
        <FormField nome="mobile" label='Mobile' value={formData.mobile} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChangeNumerico} type='tel'/>
        <FormField nome="password" label='Password' value={formData.password} colspan="col-span-12" mdcolspan="lg:col-span-6" onchange={handleChange} type='text'/>
        </div>
        <div className="col-span-12 flex justify-end">
          <button
            type="submit"
            disabled={anyUploading}
            className="border border-brand hover:bg-brand text-neutral-500 hover:text-neutral-800 dark:text-white px-6 py-1 text-xs rounded-xl font-semibold transition disabled:opacity-60 lg:w-fit w-full h-8">
            {anyUploading ? "Caricamento in corso..." : "Inserisci"}
          </button>
        </div>
      </form>
    </div>
    </>
  )
}

export function FormField ({colspan, mdcolspan, nome,label, value, onchange, type}) {
  return (
    <>
    <div className={`${colspan} ${mdcolspan}`}>
      <Label htmlFor={nome}>{label}</Label>
      <Input type={type} id={nome} placeholder={label} name={nome} value={value}  onChange={onchange} className="
        appearance-none
        focus:outline-none
        focus-visible:ring-2
      focus-visible:ring-brand
        focus-visible:ring-offset-2
        focus-visible:ring-offset-background
      focus-visible:border-brand
          "/>
    </div>
    </>
  )
}

export function FormSelect({ colspan, mdcolspan, nome, label, value, onchange, options = [] }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } })
  }

  return (
    <div className={`${colspan ?? ""} ${mdcolspan ?? ""}`}>
      <label className="block text-sm font-semibold mb-1" htmlFor={nome}>
        {label}
      </label>

      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>

        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt, idx) => (
              <SelectItem key={idx} value={String(opt)} className="
              data-[state=checked]:bg-brand
              data-[state=checked]:text-foreground
              focus:bg-brand
          ">
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
    <div className={`${colspan} ${mdcolspan} flex flex-col md:flex-col items-start md:items-start justify-between gap-2`}>
      <Label htmlFor={nome}>{label}</Label>
      <div className="flex justify-start items-center h-full w-full">
        <Checkbox
          id={nome}
          checked={!!value}
          onCheckedChange={(checked) => {
            const bool = checked === true
            onchange?.({ target: { name: nome, checked: bool } })
          }}
          className="
            h-4 w-4 shrink-0 rounded border border-gray-400
            data-[state=checked]:bg-brand
            data-[state=checked]:border-brand
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-brand
          "
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
    <div className={`${colspan ?? ""} ${mdcolspan ?? ""}`}>
      <label className="block text-sm font-semibold mb-1" htmlFor={nome}>
        {label}
      </label>

      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>

        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="
                  data-[state=checked]:bg-brand
                  data-[state=checked]:text-foreground
                  focus:bg-brand
                "
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Mantiene la compatibilità con eventuali handler generici basati su submit */}
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  )
}