'use client'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaPlusSquare, FaCar } from "react-icons/fa";
import TargaDesign from "@/app/componenti/targaDesign"

export default function SECTIONgestioneTrasporto({onDisplay, setStatusAziende}) {
    
  const [uploadingByField, setUploadingByField] = useState({});
  const anyUploading = Object.values(uploadingByField).some(Boolean);
  const [inserimentoPatente, setInserimentoPatente] = useState(true)
  const [updateAutisti, setUpdateAutisti] = useState(true)
  const [autisti, setAutisti] = useState([])
  const [updateCamion, setUpdateCamion] = useState(true)
  const [camion, setCamion] = useState([])  
  const [formDataCamion, setFormDataCamion] = useState({
    targaCamion:"",
    marcaCamion:"",
    modelloCamion: "",
  })

  const [formDataAutista, setFormDataAutista] = useState({
    numeroPatateAutista:"",
    nomeAutista:"",
    cognomeAutista: "",
    emailAutista: "",
    mobileAutista:"",
    passwordAutista:"",
  })  

  //VERIFICA PATENTE
  useEffect(() => {
    const fetchData = async () => {
      const patente = (formDataAutista.numeroPatateAutista || "")

      const { count, error } = await supabase
        .from("autista_camion_trasporto_veicoli")
        .select("n_patente_autista", { head: true, count: "exact" })
        .eq("n_patente_autista", patente)

      if (error) {
        console.error(error)
        return
      }

      if (count > 0) {
        setInserimentoPatente(false)
        console.log("PATENTE GIà REGISTRATA")
      } else {
        setInserimentoPatente(true)
      }
    }

    fetchData()
  }, [formDataAutista.numeroPatateAutista])
  
  //CARICAMENTO AUTISTI
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("autista_camion_trasporto_veicoli")
        .select('*')
      if (error) {
        console.error(error)
        return
      }
      setAutisti(data)
    }
    fetchData()
  }, [updateAutisti])

  //CARICAMENTO CAMION
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("camion_trasporto_veicoli")
        .select('*')
      if (error) {
        console.error(error)
        return
      }
      setCamion(data)
    }
    fetchData()
  }, [updateCamion])  

  function handleChangeCamion(e) {
      const { name, value } = e.target
      setFormDataCamion({ ...formDataCamion, [name]: value.toUpperCase().trim() })
  }
  function handleChangeAutista(e) {
      const { name, value } = e.target
      setFormDataAutista({ ...formDataAutista, [name]: value.toUpperCase().trim() })
  }
  function handleChangePsw(e) {
      const { name, value } = e.target
      setFormDataAutista({ ...formDataAutista, [name]: value.trim() })
  }
  async function handleSubmitCamion(e) {
    e.preventDefault()

    const payload = {
    targa_camion: formDataCamion.targaCamion || null,
    marca_camion: formDataCamion.marcaCamion || null,
    modello_camion: formDataCamion.modelloCamion || null,
    attivo_camion: true,
    }

    if (formDataCamion.marcaCamion == "" || formDataCamion.modelloCamion == "" || formDataCamion.targaCamion == ""){
      alert("Campi Vuoti")
    } else {
      const { data, error } = await supabase.from("camion_trasporto_veicoli").insert(payload).select().single()
      if (error) {
          console.error(error)
          alert(`Errore salvataggio: ${error.message}`)
          return
      } else {
        setFormDataCamion({
        targaCamion:"",
        marcaCamion: "",
        modelloCamion:"",
        })
      }
      setUpdateCamion(prev => !prev)
      console.log("Inserito:", data)
      alert("Camion inserito con successo!")
    }
  }
  async function handleSubmitAutista(e) {
    e.preventDefault()

    const payload = {
      nome_autista: formDataAutista.nomeAutista || null,
      cognome_autista: formDataAutista.cognomeAutista || null,
      n_patente_autista: formDataAutista.numeroPatateAutista || null,
      email_autista: formDataAutista.emailAutista,
      mobile_autista: formDataAutista.mobileAutista,
      attivo_autista: true,
    }

    // VALIDAZIONI
    if (
      formDataAutista.nomeAutista === "" ||
      formDataAutista.cognomeAutista === "" ||
      formDataAutista.numeroPatateAutista === "" ||
      formDataAutista.emailAutista === "" ||
      formDataAutista.passwordAutista === ""
    ) {
      alert("Campi Vuoti")
      return
    } else if (!inserimentoPatente) {
      alert("Patente/Autista già inserito")
      return
    } else if (!formDataAutista.passwordAutista || formDataAutista.passwordAutista.length < 6) {
      alert("La password deve avere almeno 6 caratteri")
      return
    }

    // INSERIMENTO UTENTE AUTENTICATO
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formDataAutista.emailAutista,
        password: formDataAutista.passwordAutista,
        options: {
          data: {
            display_name: `${formDataAutista.cognomeAutista} ${formDataAutista.nomeAutista}`,
            mobile: formDataAutista.mobileAutista,
            ruolo: "transporter"
          },
        },
      })

      if (authError) {
        console.error("Errore signUp auth:", authError)
        alert(`Errore registrazione utente: ${authError.message}`)
        return
      }

      const authUserId = authData?.user?.id || null
      payload.uuid_autista_ctv = authUserId

      // 2️⃣ INSERIMENTO AUTISTA NELLA TABELLA
      const { data, error } = await supabase
        .from("autista_camion_trasporto_veicoli")
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error(error)
        alert(`Errore salvataggio azienda: ${error.message}`)
        return
      }

      // 3️⃣ RESET FORM
      setFormDataAutista({
        numeroPatateAutista:"",
        nomeAutista:"",
        cognomeAutista: "",
        emailAutista: "",
        mobileAutista:"",
        passwordAutista:"",
      })
      setUpdateAutisti(prev => !prev)
      console.log("Inserito:", data)
      alert("Autista/Utente inserito con successo!")
    } catch (err) {
      console.error("Errore imprevisto:", err)
      alert("Si è verificato un errore imprevisto")
    }
  }

  return (
      <>
      <div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full`}>
        <div className="flex lg:flex-row flex-col flex-wrap gap-y-3 w-full min-h-0">
          {/* CRUSCOTTO */}
          {/* <div className="flex flex-row w-full gap-4 min-h-0 p-5 rounded-2xl bg-neutral-950">
            <div className="col-span-12 flex flex-row justify-between">
              <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">CRUSCOTTO</h4>
            </div>
          </div> */}
          {/* ELENCO CAMION */}
          <div className="flex flex-col gap-2 xl:basis-6/12 w-full p-1 h-60">
						<div className="col-span-12 flex flex-row justify-between">
								<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">ELENCO CAMION</h4>
						</div>
            <div className="border px-3 pb-4 pt-1 rounded-2xl h-full overflow-auto">
              <div className="flex flex-wrap  gap-2 w-full mt-2">
                {camion.map((c, i) => (
                  <div key={c.uuid_camion_trasporto_veicoli} className="w-36">
                  <TargaDesign targa={c.targa_camion}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ELENCO AUTISTI */}
          <div className="flex flex-col gap-2 xl:basis-6/12 w-full p-1 h-60">
						<div className="col-span-12 flex flex-row justify-between">
							<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">ELENCO AUTISTI</h4>
						</div>
            <div className="border px-3 pb-4 pt-1 rounded-2xl h-full overflow-auto">
              <div className="flex flex-col gap-2 text-xs mt-2">
                {autisti.map((a, i) => (
                  <div key={i} className="flex flex-row border px-2 py-1 rounded-lg gap-1">
                    <span className="text-brand font-bold truncate overflow-hidden">{a.nome_autista} {a.cognome_autista}</span>
                    <span className="text-[0.6rem]">| {a.n_patente_autista} | {a.mobile_autista} | <font className="lowercase">{a.email_autista}</font> </span>
                  </div>
                ))}
              </div>
            </div>
          </div>                 
          {/* INSERIMENTO CAMION */}
          <div className="flex flex-col gap-4 w-full bg-white dark:bg-neutral-950 dark:border-none border p-5 rounded-2xl">    
            <div className="col-span-12 flex flex-row justify-between">
                <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">INSERIMENTO CAMION</h4>
                <button
                form="inserimentoCamion"
                type="submit"
                disabled={anyUploading}
                className=' bg-brand px-3 py-2 w-fit rounded-xl h-full'>
                {anyUploading ? "Caricamento in corso..." : <FaPlusSquare className='font-bold text-white'/>}
                </button>
            </div>
            <form id="inserimentoCamion" onSubmit={handleSubmitCamion} className="flex lg:flex-row flex-col lg:gap-4 gap-2">
              <FormField nome="targaCamion" label='Targa' value={formDataCamion.targaCamion} basis="lg:basis-4/12 basis-full" onchange={handleChangeCamion} type='text'/>
              <FormField nome="marcaCamion" label='Marchio' value={formDataCamion.marcaCamion} basis="lg:basis-4/12 basis-full" onchange={handleChangeCamion} type='text'/>
              <FormField nome="modelloCamion" label='Modello' value={formDataCamion.modelloCamion} basis="lg:basis-4/12 basis-full" onchange={handleChangeCamion} type='text'/>
            </form>
          </div>
          {/* INSERIMENTO AUTISTA */}
          <div className="flex flex-col gap-4 w-full bg-white dark:bg-neutral-950 dark:border-none border p-5 rounded-2xl">  
            <div className="col-span-12 flex flex-row justify-between">
                <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">INSERIMENTO AUTISTA</h4>
                <button
                form="inserimentoAutista"
                type="submit"
                disabled={anyUploading}
                className=' bg-brand px-3 py-2 w-fit rounded-xl h-full'>
                {anyUploading ? "Caricamento in corso..." : <FaPlusSquare className='font-bold text-white'/>}
                </button>
            </div>
            <form id="inserimentoAutista" onSubmit={handleSubmitAutista} className="flex flex-wrap gap-y-2">
              <FormField nome="nomeAutista" label='Nome' value={formDataAutista.nomeAutista} basis="lg:basis-3/12 basis-6/12 px-2" onchange={handleChangeAutista} type='text'/>
              <FormField nome="cognomeAutista" label='Cognome' value={formDataAutista.cognomeAutista} basis="lg:basis-3/12 basis-6/12 px-2" onchange={handleChangeAutista} type='text'/>
              <FormField nome="numeroPatateAutista" label='N° Patente' value={formDataAutista.numeroPatateAutista} basis="lg:basis-3/12 basis-6/12 px-2" onchange={handleChangeAutista} type='text'/>
              <FormField nome="mobileAutista" label='Telefono' value={formDataAutista.mobileAutista} basis="lg:basis-3/12 basis-6/12 px-2" onchange={handleChangeAutista} type='text'/>
              <FormField nome="emailAutista" label='Email' value={formDataAutista.emailAutista} basis="lg:basis-4/12 basis-full px-2" onchange={handleChangePsw} type='email'/>
              <FormField nome="passwordAutista" label='Password' value={formDataAutista.passwordAutista} basis="lg:basis-3/12 basis-full px-2" onchange={handleChangePsw} type='password'/>
            </form>
          </div>
        </div>
      </div>
      </>
  )

}

export function FormField ({basis, nome, label, value, onchange, type}) {
  return (
    <>
    <div className={`${basis}`}>
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