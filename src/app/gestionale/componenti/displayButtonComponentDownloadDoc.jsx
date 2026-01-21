export function ButtonLinkDisplayDownloadDOC ({label, info, icon,linkHref, targetType}) {

    const dis = !linkHref

    return (
        <>
        <a href={`${linkHref}`} target={targetType} rel="noopener noreferrer">
        <button
        disabled={dis}
        className={`flex flex-row items-center text-[0.7rem] font-light gap-2 border hover:border-brand hover:bg-brand p-1 transition-all px-2 rounded-lg`}
        alt={label}
        >
            {icon} <font className="font-semibold">{info}</font>
        </button>
        </a>
        </>
    )
}