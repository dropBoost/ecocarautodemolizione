'use client'

import { moduliGestionale } from "@/app/cosetting"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/app/admin/components/AdminContext"
import AnalisiConsegnaDemolizione from "./componenti/analisiConsegnaDemolizione"

export default function PAGEdashboard () {

    const pathname = usePathname()
    const moduloAttivo = moduliGestionale.find(m => m.link === pathname)
    const utente = useAdmin().utente
    const ruolo = utente?.user_metadata.ruolo

    if (moduloAttivo?.attivo == "false" && ruolo != "superadmin") {
        return (
            <>
            <span>MODULO</span> <span className="uppercase">{moduloAttivo.name}</span> <span>NON ATTIVO - contattare l'assistenza</span>
            </>
        )
    }

    return (
        <>
        <div className="flex flex-wrap min-h-0 w-full justify-start items-start overflow-auto gap-3">
					<div className="lg:basis-6/12 basis-full p-2">
						<AnalisiConsegnaDemolizione/>
					</div>
					{/* <div className="basis-6/12">
						<AnalisiConsegnaDemolizione/>
					</div> */}
        </div>
        
        </>
    )
}