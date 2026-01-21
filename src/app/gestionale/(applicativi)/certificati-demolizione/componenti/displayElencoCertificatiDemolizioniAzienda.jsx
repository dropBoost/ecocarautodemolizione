
import { FaFileDownload } from "react-icons/fa";
import { TbBrandWhatsappFilled } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { FaCarAlt } from "react-icons/fa";
import { LinkComponentContact } from "@/app/gestionale/componenti/displayLinkComponentContact";
import { ButtonLinkDisplayDownloadDOC } from "@/app/gestionale/componenti/displayButtonComponentDownloadDoc";
import { RiEyeCloseLine } from "react-icons/ri";
import TargaDesign from "@/app/componenti/targaDesign";
import { useAdmin } from "@/app/admin/components/AdminContext";


export default function DisplayCertificatiDemolizioniAzienda ({
    uuid, targa, telaio, mobile,completata,tipologiaDemolizione, email, data, note, docDemolizione, altroDocDemolizione, uuidAzienda, uuidCD
    }) {

    const utente = useAdmin()
    const role = utente?.utente?.user_metadata?.ruolo
    const isAdmin = role === "admin" || role === "superadmin"

    return (
        <>
        <div className="flex lg:flex-row flex-col min-h-0 w-full border lg:items-center justify-between items-start rounded-xl p-3 gap-2 bg-white dark:bg-neutral-900  hover:border-brand transition-all">
            <div className="flex lg:flex-row flex-col lg:w-fit w-full justify-start lg:items-start items-start gap-1 min-h-0 h-full overflow-auto">
                <div className="flex flex-col xl:flex-row justify-between w-full h-full">
                    <div className="flex flex-col justify-start items-start lg:min-w-[16rem] h-full gap-1">
                        <div className={`flex flex-row gap-1 items-center border border-neutral-500 w-fit rounded-md px-2`}>
                            <span className={`text-xs dark:text-neutral-400`}>{data}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="min-w-36 max-w-36">
                                <TargaDesign targa={targa}/>
                            </div>
                            {telaio ? 
                            <div className="flex flex-row gap-1 items-center border border-brand w-fit rounded-lg px-2">
                                <FaCarAlt className="text-brand text-xs"/> 
                                <span className={`text-xs dark:text-neutral-400 font-semibold truncate text-ellipsis`}>VIN: <font className="text-xs dark:text-neutral-500 font-medium italic uppercase">{telaio}</font></span> 
                            </div> : "" }
                        </div>
                        {note == "" ? "" :
                        <div className={`flex flex-row gap-1 items-center w-fit rounded-md px-2`}>
                            <p className={`text-xs dark:text-neutral-400 `}><font className="text-red-600">Note:</font> {note}</p>
                        </div>
                        }
                    </div>
                    <div className="flex flex-col justify-start items-start h-full gap-1 border-s-0 xl:border-s border-t xl:border-t-0 ps-0 pt-2 xl:pt-0 mt-2 xl:mt-0 xl:ps-3">
                        <LinkComponentContact label="mobile detentore" icon={<TbBrandWhatsappFilled/>} info={mobile} linkHref={`https://wa.me/`}/>
                        <LinkComponentContact label="email detentore" icon={<MdEmail/>} info={email} linkHref={`mailto:`}/>
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-end items-start lg:gap-3 gap-3 lg:w-fit w-full lg:p-1 p-2">
                <ButtonLinkDisplayDownloadDOC targetType={`_blank`} linkHref={docDemolizione} info={"DEMOLIZIONE"} icon={<FaFileDownload/>}/>
                {altroDocDemolizione ? <ButtonLinkDisplayDownloadDOC targetType={`_blank`} linkHref={altroDocDemolizione} info={"ALTRO"} icon={<FaFileDownload/>}/> : ""}
                {isAdmin ? <ButtonLinkDisplayDownloadDOC targetType={`_self`} linkHref={`./${uuidAzienda}/${uuidCD}`} info={"VISUALIZZA"} icon={<RiEyeCloseLine/>}/> : "" }
            </div>
        </div>
        </>
    )
}