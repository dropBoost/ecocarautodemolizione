'use client'

import Link from "next/link"
import { FaFileDownload, FaCar } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import { BsFillTelephoneFill } from "react-icons/bs";
import { TbBrandWhatsappFilled } from "react-icons/tb";
import { GiSteeringWheel } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { LinkComponentContact } from "@/app/gestionale/componenti/displayLinkComponentContact";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient"

export default function DisplayAziendeRitiro ({uuid, ragioneSociale, piva, stato, sdi, email, tel, mobile, sedeLegale, rules, setStatusAziende}) {
    
    const [statoAzienda, setStatoAzienda] = useState(stato)

    // AZIENDA ON OFF
    async function ActiveCompany(uuidAzienda) {

        if (!uuidAzienda) return

        const next = !statoAzienda

        // aggiorno UI subito
        setStatoAzienda(next)

        const { data, error } = await supabase
            .from("azienda_ritiro_veicoli")
            .update({ attiva_arv: next })
            .eq("uuid_azienda_ritiro_veicoli", uuidAzienda)
            .select()
            .single()

        if (error) {
            console.error(error)
            // rollback UI se fallisce
            setStatoAzienda(!next)
            alert(`Errore salvataggio: ${error.message}`)
            return
        }
        setStatusAziende(prev => !prev)
        alert("Azienda aggiornata con successo")
    }

    // HANDLECHANGE ON OFF
    function onOff() {
    
    }
    
    return (
        <>
        <div className="flex flex-col min-h-0 w-full border justify-between hover:border-brand transition-all rounded-xl p-3 gap-2 bg-white dark:bg-neutral-900">
            <div className="flex flex-col justify-start items-start min-h-0 h-full lg:mt-1 m-0">
                    <ButtonCompanyOnOff onClick={()=> ActiveCompany(uuid)} stato={stato}/>
            </div>
            <div className="flex lg:flex-row flex-col gap-5">
                {/* dati azienda */}
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-brand uppercase truncate text-ellipsis">{ragioneSociale} <font className="text-xs lowercase text-neutral-600 font-medium italic">{rules}</font></span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs truncate">{sedeLegale}</span>
                        <span className="text-xs truncate">{piva} / {sdi}</span>
                    </div>
                </div>
                <div className="flex flex-wrap justify-start items-center h-full gap-1 lg:border-s lg:ps-3">
                    <LinkComponentContact label="telefono" icon={<BsFillTelephoneFill/>} info={tel} linkHref={`tel:`}/>
                    <LinkComponentContact label="mobile" icon={<TbBrandWhatsappFilled/>} info={mobile} linkHref={`https://wa.me/`}/>
                    <LinkComponentContact label="email" icon={<MdEmail/>} info={email} linkHref={`mailto:`}/>
                </div>
            </div>
            <div className="flex flex-row justify-end items-end gap-1 h-full text-xs">
                <Link className="p-2 bg-brand/70 rounded-md hover:bg-brand" href={`ritiri-demolizioni/${uuid}`}><FaFileDownload /></Link>
                <Link className="p-2 bg-brand/70 rounded-md hover:bg-brand" href={`ritiri-demolizioni/${uuid}`}><RiEyeCloseLine/></Link>
                <Link className="p-2 bg-brand/70 rounded-md hover:bg-brand" href={`ritiri-demolizioni/${uuid}`}><FaCar/></Link>
            </div>
        </div>
        </>
    )
}

export function ButtonCompanyOnOff ({onClick, stato}) {
    return (
        <button onClick={onClick}>{stato === true ? <FaToggleOn className="text-brand"/> : <FaToggleOff className="text-red-600"/>}</button>
    )
}