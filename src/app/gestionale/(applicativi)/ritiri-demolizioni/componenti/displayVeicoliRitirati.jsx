import Link from "next/link"
import { FaFileDownload } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import { FaCarAlt, FaTrash } from "react-icons/fa";
import TargaDesign from "@/app/componenti/targaDesign";
import ButtonScaricaRitiroPDF from "@/app/componenti/pdf/buttonScaricaRitiroPDF";
import DeleteRecordWithBucketsButton from "@/app/componenti/DeleteRecordButton";
import { useAdmin } from "@/app/admin/components/AdminContext";

export default function DisplayVeicoliRitirati ({
	uuid, uuidAzienda, targa, modelloVeicolo, telaio, nome, cognome, mobileDetentore,completata,tipologiaD,ragioneSociale, piva, cf, email, documento, data,
	veicoloConsegnato, veicoloRitirato, demolizioneApprovata, formaLegale, vinLeggibile, documentoDetentore, nDocDetentore, indirizzo, gravami,
	iDocVeicoloF, iDocVeicoloR, iDocDetentoreF, iDocDetentoreR, iComplementareF, iComplementareR, setUpdateList
	}) {
	
	const utente = useAdmin()
	const role = utente?.utente?.user_metadata?.ruolo
	const isAdmin = role === "admin" || role === "superadmin";

	const statoDemolizione = demolizioneApprovata == null ? "pratica in attesa" : (demolizioneApprovata ? "demolizione approvata" : "demolizione non approvata")
	const statoTrasporto = demolizioneApprovata ? (veicoloConsegnato ? "veicolo consegnato" : (veicoloRitirato ? "veicolo in transito" : "veicolo non ritirato")) : null
	
	const targaNormalizzata = String(targa ?? "").trim().toLowerCase();
	const folderVeicoli = `public/${uuidAzienda}/${targaNormalizzata}`;
	const folderDetentori = `public/${uuidAzienda}/${targaNormalizzata}`;

	return (
		<>
		<div className="flex flex-row min-h-0 lg:h-56 h-full w-full border justify-between items-start rounded-xl p-3 gap-2">
			<div className="flex flex-1 flex-col justify-between items-start min-h-0 h-full lg:gap-0 gap-4">
				{/* DATI VEICOLO */}
				<div className="flex flex-col flex-1 justify-start items-start gap-1">
					<div className={`flex flex-row gap-1 items-center border border-neutral-500 w-fit rounded-md px-2`}>
						<span className={`text-xs text-neutral-400`}>{data}</span>
					</div>
					<div className="flex flex-col gap-1">
						<TargaDesign targa={targa}/>
						{telaio ? <span className={`border border-brand rounded-lg px-2 py-1 text-xs truncate text-ellipsis w-fit`}>Telaio:<font className="text-xs text-neutral-400 font-medium italic uppercase"> {telaio}</font></span> : <span className="border bg-red-700 rounded-lg px-2 py-1 text-[0.55rem] truncate text-ellipsis w-fit uppercase"> telaio non leggibile</span>}
						<div className="flex flex-row gap-1 items-center border border-neutral-500 w-fit rounded-lg px-2">
								<FaCarAlt className="text-brand text-xs"/>
								<span className={`text-sm font-semibold uppercase truncate text-ellipsis`}>{modelloVeicolo} <font className="text-xs text-neutral-500 font-medium italic lowercase">{documento}</font></span>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						{tipologiaD == "azienda" ?
							<>
								<span className="text-xs font-light truncate">{ragioneSociale}</span>
								<span className="text-xs font-light truncate">{nome} {cognome} / <font className="italic text-yellow-600">{tipologiaD}</font></span>
								<span className="text-xs font-light truncate">{piva}</span>
							</>    
								:
							<>    
								<span className="text-xs font-light truncate">{nome} {cognome} / <font className="italic text-blue-600">{formaLegale}</font></span>
								<span className="text-xs font-light truncate">{cf}</span>
							</>    
						}
					</div>
				</div>
				{/* TAG STATO */}
				<div className="flex flex-wrap flex-row justify-start items-start min-h-0 gap-1">
					<div className={`${statoDemolizione == "demolizione approvata" ? "bg-brand/60" : "border-red-600"} border px-2 py-1 rounded-lg`}>
						<span className="flex items-center justify-start text-[0.6rem] font-bold"> {statoDemolizione}</span>
					</div>
					<div className={`${statoTrasporto === null ? "hidden" : "" } ${statoTrasporto == "veicolo consegnato" ? "bg-brand/60" : ""} ${statoTrasporto == "veicolo non ritirato" ? "border-red-600" : ""} ${statoTrasporto == "veicolo in transito" ? "border-orange-400" : ""} border px-2 py-1 rounded-lg`}>
						<span className="flex items-center justify-start text-[0.6rem] font-bold"> {statoTrasporto}</span>
					</div>
					<div className={`${!veicoloConsegnato ? "hidden" : "" } ${!completata ? "border-red-600" : "bg-brand/60"} border px-2 py-1 rounded-lg`}>
						<span className="flex items-center justify-start text-[0.6rem] font-bold"> {!completata ? "demolizione in attesa" : "demolizione completata"}</span>
					</div>	
				</div>
			</div>
			{/* BOTTONI */}
			<div className="flex lg:flex-row flex-col justify-end items-end h-full gap-1 text-xs">
				<ButtonScaricaRitiroPDF payload={{
					uuidRitiroVeicolo: uuid,
					vinLeggibile: vinLeggibile,
					vin: telaio,
					targa: targa,
					modello: modelloVeicolo,
					tipologiaDetentore: tipologiaD,
					formaLegale: formaLegale,
					ragioneSociale: ragioneSociale,
					indirizzo: indirizzo,
					nome: nome,
					cognome: cognome,
					cf: cf,
					piva: piva,
					tipologiaDocDet: documentoDetentore,
					numeroDocDet: nDocDetentore,
					email: email,
					mobile: mobileDetentore,
					tipDocVeic: documento,
					docGravami: gravami,
					praticaCompletata: `${"fffff"}`,
					dataRitiro: data,
					iDocVeicoloF:iDocVeicoloF,
					iDocVeicoloR:iDocVeicoloR,
					iDocDetentoreF:iDocDetentoreF,
					iDocDetentoreR:iDocDetentoreR,
					iComplementareF:iComplementareF,
					iComplementareR:iComplementareR,
				}}/>
				<Link className="p-2 bg-brand/70 rounded-md hover:bg-brand" href={`ritiri-demolizioni/${uuid}`}><RiEyeCloseLine/></Link>
				{isAdmin ? 
				<DeleteRecordWithBucketsButton
					table="dati_veicolo_ritirato"
					idColumn="uuid_veicolo_ritirato"
					uuid={uuid}
					label = {<FaTrash/>}
					targa={targa}
					storage={[
						{ bucket: "documentiveicoli", folder:folderVeicoli },
						{ bucket: "documentidetentori", folder:folderDetentori },
					]}
					onDeleted={() => setUpdateList((p) => !p)}
				/>
				: null }
			</div>
		</div>
		</>
	)
}