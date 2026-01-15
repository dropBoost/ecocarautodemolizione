'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaPlusSquare, FaCar } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { GiEuropeanFlag } from "react-icons/gi";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import TargaDesign from "@/app/componenti/targaDesign"

export default function InserimentoModelliVeicoli({onDisplay, setStatusAziende}) {
    
  const [uploadingByField, setUploadingByField] = useState({});
  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const [aziendaScelta, setAziendaScelta] = useState("")
  const [aziendeRitiro, setAziendeRitiro] = useState([])
  const [veicoliAzienda, setVeicoliAzienda] = useState([])
  const [marchiAuto, setMarchiAuto] = useState([])
  const [modelloAuto, setModelloAuto] = useState([])
  const [updateCamion, setUpdateCamion] = useState(false)
  const [formData, setFormData] = useState({
    marchioVeicolo:"",
    modelloVeicolo: "",
  })

  //RECUPERO MODELLI AUTO
  useEffect(() => {
    
  const fetchData = async () => {

    const { data, error } = await supabase
      .from("modello_veicolo")
      .select("*")
      .eq("marca", formData?.marchioVeicolo)
      .eq("modello", formData?.modelloVeicolo)

    if (error) {
      console.error(error)
      return
    }

    setModelloAuto(data)

  }

  fetchData()
  }, [formData.marchioVeicolo, formData.modelloVeicolo])

  //RECUPERO MODELLI DA MARCHIO AUTO
  useEffect(() => {
    
  const fetchData = async () => {

    const { data, error } = await supabase
      .from("modello_veicolo")
      .select("*")
      .eq("marca", formData?.marchioVeicolo)

    if (error) {
      console.error(error)
      return
    }

    setMarchiAuto(data)

  }

  fetchData()
  }, [formData.marchioVeicolo])
  
  function handleChange(e) {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value.toUpperCase().trim() })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
    marca: formData.marchioVeicolo || null,
    modello: formData.modelloVeicolo || null,
    }

    if (formData.marchioVeicolo == "" || formData.modelloVeicolo == ""){
      alert("Campi Vuoti")
    } else if (modelloAuto.length > 0) {
      alert("Veicolo già presente")
    } else {
      const { data, error } = await supabase.from("modello_veicolo").insert(payload).select().single()
      if (error) {
          console.error(error)
          alert(`Errore salvataggio: ${error.message}`)
          return
      } else {
        setFormData({
        marchioVeicolo: "",
        modelloVeicolo:"",
        })
      }
      setStatusAziende(prev => !prev)
      setUpdateCamion(prev => !prev)
      console.log("Inserito:", data)
      alert("Modello veicolo inserito con successo!")
    }
  }



    return (
        <>
        <div className={`${onDisplay === 'on' ? '' : 'hidden'} w-full h-full`}>
        <div className="flex flex-col gap-4">    
            <div className="col-span-12 flex flex-row justify-between">
                <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">INSERIMENTO MODELLO VEICOLO</h4>
                <button
                form="inserimentoCamion"
                type="submit"
                disabled={anyUploading}
                className=' bg-brand px-3 py-2 w-fit rounded-xl h-full'>
                {anyUploading ? "Caricamento in corso..." : <FaPlusSquare className='font-bold text-white'/>}
                </button>
            </div>
            <form id="inserimentoCamion" onSubmit={handleSubmit} className="flex flex-col gap-4 border dark:border-none dark:bg-neutral-950 p-5 rounded-2xl">
              <FormField nome="marchioVeicolo" label='Marchio' value={formData.marchioVeicolo} colspan="col-span-12" mdcolspan="lg:col-span-4" onchange={handleChange} type='text'/>
              <FormField nome="modelloVeicolo" label='Modello' value={formData.modelloVeicolo} colspan="col-span-12" mdcolspan="lg:col-span-4" onchange={handleChange} type='text'/>
            </form>
            {marchiAuto.length > 0 ? 
            <div className="flex flex-col gap-4 border border-brand p-5 rounded-2xl">
              <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl uppercase">Modello Presente in Archivio</h4>
              <div className="flex flex-row flex-wrap w-full">
                {marchiAuto.map(ma => (
                  <>
                  <div className="flex flex-row items-center justify-between rounded-xl basis-1/2 lg:basis-1/3 xl:basis-1/6 p-1">
                    <div className="flex flex-row items-center justify-between gap-2 px-3 py-2 rounded-xl h-full w-full border">
                      <span className="flex items-center justify-center gap-2 lowercase"><FaCar/>{ma.marca} {ma.modello}</span>
                    </div>
                  </div>      
                  </>
                ))}
              </div> 
            </div> : "" }
        </div>    
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