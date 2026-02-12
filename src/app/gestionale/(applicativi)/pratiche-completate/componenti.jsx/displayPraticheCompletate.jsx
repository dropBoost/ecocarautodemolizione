import Link from "next/link"
import { FaFileDownload, FaUser } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";
import TargaDesign from "@/app/componenti/targaDesign";
import ButtonScaricaRitiroPDF from "@/app/componenti/pdf/buttonScaricaRitiroPDF";
import DeleteFilesWithBucketsButton from "@/app/componenti/DeleteFileFromRecordButton";
import { useAdmin } from "@/app/admin/components/AdminContext";
import { MdNoPhotography } from "react-icons/md";

export default function DisplayPraticheCompletate ({
	uuid, uuidAzienda, targa, modelloVeicolo, telaio, nome, cognome, mobileDetentore,completata,tipologiaD,ragioneSociale, piva, cf, email, documento, data,
	veicoloConsegnato, veicoloRitirato, demolizioneApprovata, formaLegale, vinLeggibile, documentoDetentore, nDocDetentore, indirizzo, gravami,
	iDocVeicoloF, iDocVeicoloR, iDocDetentoreF, iDocDetentoreR, iComplementareF, iComplementareR, setUpdateList, emailDetentore, dataDemolizione
	}) {
	
	const utente = useAdmin()
	const role = utente?.utente?.user_metadata?.ruolo
	const isAdmin = role === "admin" || role === "superadmin";

	const statoDemolizione = demolizioneApprovata == null ? "pratica in attesa" : (demolizioneApprovata ? "demolizione approvata" : "demolizione non approvata")
	const statoTrasporto = demolizioneApprovata ? (veicoloConsegnato ? "veicolo consegnato" : (veicoloRitirato ? "veicolo in transito" : "veicolo non ritirato")) : null
	
	const targaNormalizzata = String(targa ?? "").trim().toLowerCase();
	const folderVeicoli = `public/${uuidAzienda}/${targaNormalizzata}`;
	const folderDetentori = `public/${uuidAzienda}/${targaNormalizzata}`;

	const imgTrue = Boolean(iDocVeicoloF || iDocVeicoloR || iDocDetentoreF || iDocDetentoreR || iComplementareF || iComplementareR)
	
	return (
		<>
		<div className="flex flex-row min-h-0 h-full w-full border hover:border-brand transition-all justify-between items-end rounded-xl p-3 gap-2">
			<div className="flex flex-1 flex-col justify-between items-start min-h-0 h-full gap-2">
				{/* DATI VEICOLO */}
				<div className="flex flex-col flex-1 justify-start items-start gap-2">
					<div className={`flex flex-col gap-1 items-start w-fit`}>
						<span className={`text-xs border border-sky-300 rounded-md px-2 font-semibold`}>DATA INSERIMENTO PRATICA: {data}</span>
            <span className={`text-xs text-neutral-900 border border-brand bg-brand rounded-md px-2 font-bold`}>DATA DEMOLIZIONE: {dataDemolizione}</span>
					</div>
					<div className="flex flex-col gap-1">
						<div className="min-w-36 max-w-36"><TargaDesign targa={targa}/></div>
					</div>
					<div className="flex flex-row gap-2 items-center border border-sky-600 px-2 py-1 rounded-lg">
            <FaUser className="text-sky-600 text-xs"/> <span className="text-xs truncate">{nome} {cognome}</span>
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
			<div className="flex lg:flex-row flex-col justify-end items-end gap-1 text-xs">
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
				<Link className="p-2 bg-brand/70 rounded-md hover:bg-brand" href={`ritiri-demolizioni/${uuidAzienda}/${uuid}`}><RiEyeCloseLine/></Link>
				{isAdmin && imgTrue ? 
				<DeleteFilesWithBucketsButton
					table="dati_veicolo_ritirato"
					idColumn="uuid_veicolo_ritirato"
					uuid={uuid}
					label = {<MdNoPhotography/>}
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