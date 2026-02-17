'use client'

import { useAdmin } from "@/app/admin/components/AdminContext"
import { AnalisiConsegnaDemolizioneLine } from "./componenti/analisiConsegnaDemolizioneLine"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalisiAziendaRitiro } from "./componenti/analisiAziendeRitiro"
import { AnalisiTrasportatori } from "./componenti/analisiTrasportatori"

export default function PAGEdashboard () {

		const utente = useAdmin()
  	const role = utente?.utente?.user_metadata?.ruolo
		const isAdmin = role === "admin" || role === "superadmin"

		const [caricamentoDati, setCaricamentoDati] = useState(0)

		const currentYear = new Date().getFullYear()

		let startMonth = ``
		let startYear = `${new Date().getFullYear()}`

		function numberMonth () {
			if (new Date().getMonth() > 0 && new Date().getMonth() < 9){
				return startMonth = `0${new Date().getMonth()+1}`
			} else {
				return startMonth = `${new Date().getMonth()+1}`
			}
		}

		numberMonth()

		const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

		const [dataAnalisi, setDataAnalisi] = useState({
			mese:startMonth,
			anno:startYear
		})

    if (!isAdmin) return

		const handleChangeAnalisi = (field) => (value) => {
			setDataAnalisi((prev) => ({
				...prev,
				[field]: value,
			}))
		}



    return (
		<>
		<div className="flex flex-col min-h-0 w-full justify-start items-start overflow-auto">
			<div className="flex flex-row gap-2 basis-full p-2">
			{/* MESE */}
			<Select
				value={dataAnalisi.mese}
				onValueChange={handleChangeAnalisi("mese")}
			>
				<SelectTrigger className="w-full max-w-48">
					<SelectValue placeholder="...mese" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						<SelectLabel>Mese</SelectLabel>
						<SelectItem value="01">Gennaio</SelectItem>
						<SelectItem value="02">Febbraio</SelectItem>
						<SelectItem value="03">Marzo</SelectItem>
						<SelectItem value="04">Aprile</SelectItem>
						<SelectItem value="05">Maggio</SelectItem>
						<SelectItem value="06">Giugno</SelectItem>
						<SelectItem value="07">Luglio</SelectItem>
						<SelectItem value="08">Agosto</SelectItem>
						<SelectItem value="09">Settembre</SelectItem>
						<SelectItem value="10">Ottobre</SelectItem>
						<SelectItem value="11">Novembre</SelectItem>
						<SelectItem value="12">Dicembre</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			{/* ANNO */}
			<Select
				value={dataAnalisi.anno}
				onValueChange={handleChangeAnalisi("anno")}
			>
				<SelectTrigger className="w-full max-w-48">
					<SelectValue placeholder="...anno" />
				</SelectTrigger>

				<SelectContent>
					<SelectGroup>
						<SelectLabel>Anno</SelectLabel>
						{years.map((year) => (
							<SelectItem key={year} value={year}>
								{year}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			</div>
			<div className="grid grid-cols-1 xl:grid-cols-3 w-full">
				<div className="p-2">
					<AnalisiConsegnaDemolizioneLine dataA={dataAnalisi} setCaricamento={setCaricamentoDati} />
				</div>

				<div className="p-2">
					<AnalisiAziendaRitiro dataA={dataAnalisi} setCaricamentoDati={setCaricamentoDati} />
				</div>

				<div className="p-2">
					<AnalisiTrasportatori dataA={dataAnalisi} setCaricamentoDati={setCaricamentoDati} />
				</div>
			</div>
		</div>
		</>
    )
}