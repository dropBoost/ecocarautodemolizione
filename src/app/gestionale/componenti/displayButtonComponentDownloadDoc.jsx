export function ButtonLinkDisplayDownloadDOC ({label, info, icon,linkHref, targetType}) {

    const dis = !linkHref

    return (
        <>
        <a href={`${linkHref}`} target={targetType} rel="noopener noreferrer">
        <button
        disabled={dis}
        className={`flex flex-row items-center text-xs font-light gap-2 bg-brand hover:text-neutral-950 p-1 hover:border px-2 rounded-lg ${!dis ? "hover:bg-white" : "hover:bg-none hover:border-none"} `}
        alt={label}
        >
            {icon} <font className="font-semibold">{info}</font>
        </button>
        </a>
        </>
    )
}