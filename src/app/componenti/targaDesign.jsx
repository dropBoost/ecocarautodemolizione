import { GiEuropeanFlag } from "react-icons/gi"
import { FaMinusCircle } from "react-icons/fa"

export default function TargaDesign ({targa, buttonFuction}) {
    return(
        <>
        <div className="flex flex-row w-full border border-blue-900">
            <div className="basis-1/6 border flex items-end justify-center bg-blue-900">
                <span className="text-[0.5em] text-white"> IT </span>
            </div>
            <div className="bg-neutral-200 flex items-center justify-center basis-4/6 border px-2 text-neutral-900 font-bold">
                <p>{targa}</p>
            </div>
            <div className="basis-1/6 border flex items-center justify-center bg-blue-900">
                <GiEuropeanFlag className="text-[0.7rem] text-yellow-200"/>
            </div>
        </div>
        {buttonFuction ?
        <div className="w-fit">
        <button onClick={buttonFuction} className="flex items-center justify-center bg-red-700 w-4 h-4 rounded-full text-[0.6rem]"><FaMinusCircle/></button>
        </div> : null}
        </>
    )
}