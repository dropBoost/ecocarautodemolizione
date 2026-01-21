import Link from "next/link"
import { FaFileDownload } from "react-icons/fa";
import { RiEyeCloseLine } from "react-icons/ri";

export default function DisplayAziendeRitiriDemolizioni ({uuid, n, pl, ar, ragioneSociale, piva}) {

    return (
        <>
        <div className={`flex lg:flex-row flex-col min-h-0 w-full border lg:items-center justify-between items-start ${n > 0 ? `border-red-700` : `` } hover:border-brand transition-all rounded-xl p-3 gap-1 bg-white dark:bg-neutral-900`}>
            <div className="flex lg:flex-row flex-col justify-start items-start lg:items-center gap-1 flex-1">
                <div className="flex flex-col justify-start items-center w-fit me-2 h-fit">
                    {n == 0
                    ?
                    <div className="flex lg:flex-col flex-row gap-1 lg:items-center lg:justify-between justify-between w-full"> 
                        <span className="flex items-center justify-center border bg-brand rounded-full w-3 h-3 text-[0.6rem]">{null}</span>
                    </div>
                    : <div className="flex lg:flex-col flex-row gap-1 lg:items-center lg:justify-between justify-between w-full">
                        <span className="flex items-center justify-center border bg-red-600 rounded-full w-3 h-3 text-[0.6rem] font-bold">{null}</span>
                    </div>
                    }
                </div>
                <div className="flex flex-col justify-center lg:items-start items-start lg:min-w-[16rem] h-full">
                    <span className="text-sm font-semibold text-brand uppercase truncate text-ellipsis">{ragioneSociale}</span>
                    <span className="text-xs ">{piva}</span>
                </div>
                <div className={`${n <= 0 ? "hidden" : ""} border border-brand px-2 py-1 rounded-lg`}>
                    <span className="flex items-center justify-start text-[0.6rem] font-bold"> Pratiche in corso: {n}</span>
                </div>
                <div className={`${pl <= 0 ? "hidden" : ""} border border-red-600 px-2 py-1 rounded-lg`}>
                    <span className="flex items-center justify-start text-[0.6rem] font-bold"> Pratiche da lavorare: {pl}</span>
                </div>
                <div className={`${ar <= 0 ? "hidden" : ""} border border-yellow-500 px-2 py-1 rounded-lg`}>
                    <span className="flex items-center justify-start text-[0.6rem] font-bold"> Attesa Ritiro: {ar}</span>
                </div>
            </div>
            <div className="flex flex-row items-start lg:gap-3 gap-1 rounded-md lg:p-1 p-2">
                <div className="flex flex-col justify-center items-start w-fit h-full">
                    <Link className="lg:p-2 p-1 bg-brand/70 rounded-md hover:bg-brand text-xs" href={`ritiri-demolizioni/${uuid}`}><FaFileDownload /></Link>
                </div>
                <div className="flex flex-col justify-center items-start w-fit h-full">
                    <Link className="lg:p-2 p-1 bg-brand/70 rounded-md hover:bg-brand text-xs" href={`ritiri-demolizioni/${uuid}`}><FaFileDownload /></Link>
                </div>
                <div className="flex flex-col justify-center items-start w-fit h-full">
                    <Link className="lg:p-2 p-1 bg-brand/70 rounded-md hover:bg-brand text-xs" href={`ritiri-demolizioni/${uuid}`}><RiEyeCloseLine/></Link>
                </div>
            </div>
        </div>
        </>
    )
}