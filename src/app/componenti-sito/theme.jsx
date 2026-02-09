'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { HomeButton, ThemeToggle, LogoutButton, PlusButton } from '@/app/componenti/button'
import { useAdmin } from '@/app/admin/components/AdminContext'
import { MdCloudDownload } from "react-icons/md";

export function Header () {

    const [openMenu, setOpenMenu] = useState(false)

    return(
        <>
        <div className="flex md:flex-row flex-col gap-3 justify-between items-center py-5 lg:px-10 px-5 w-full bg-companyPrimary">
					<div id="logo-cnt" className="md:max-w-48 md:my-0 my-3">
							<Image src={'/assets/logo-white.png'} width={150} height={50} quality={100} alt="logo-company" className="md:max-w-48 w-56"/>
					</div>
					<div className="flex flex-row gap-2 md:w-fit w-full justify-between">
						<nav className="flex flex-row md:justify-center justify-start items-center flex-1 rounded-md">
							<ul className="flex flex-row text-xs text-white gap-3 h-full">
								<Link href={"/#chi-siamo"} className="text-xs flex items-center hover:text-companySecondary hover:bg-neutral-100 border border-white h-full px-4 py-1 rounded-md font-bold">CHI SIAMO</Link>
								<Link href={"/#contatti"} className="text-xs flex items-center hover:text-companySecondary hover:bg-neutral-100 border border-white h-full px-4 py-1 rounded-md font-bold">CONTATTI</Link>
							</ul>
						</nav>
						<div id="btn-cnt" className="flex flex-row items-center justify-between gap-3 bg-neutral-100 text-xl dark:text-neutral-900 px-4 py-1 rounded-md">
							<Link href="/download-demolizione" className="flex flex-row gap-2 items-center hover:text-companySecondary font-bold"><font className="text-xs">SCARICA ROTTAMAZIONE</font> <MdCloudDownload/></Link>
						</div>
					</div>
        </div>
        {/* <div className={`${openMenu? "flex flex-row p-5 gap-10" : "hidden"} `}>
            <div id="col-one" className="">
                <h3 className="text-neutral-500">CIAO</h3>
            </div>
            <div id="col-one" className="">
                <h3 className="text-neutral-500">CIAO</h3>
            </div>
        </div> */}
        </>
    )
}

export function FooterInfo () {
    return(
        <>
        <div className="h-24 flex flex-row justify-between items-center bg-brand border w-full">
            <button variant='secondary'>Button 2</button>
            <Link href="/gestionale"><button>GESTIONALE</button></Link>
            <h1 className="p-5 text-neutral-50">CIAO</h1>
        </div>
        </>
    )
}

export function Footer () {
    return(
        <>
        {/* FOOTER */}
        <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
            <p>© {new Date().getFullYear()} Ecocar Autodemolizione</p>
            <p className="sm:text-right">Acerra (NA) — Zona Industriale</p>
            </div>
        </footer>
        </>
    )
}

export function SpanElementList ({icon, label, data}) {
  return(
    <div className="flex flex-row rounded-md p-1 px-3 gap-1 items-center justify-start text-sm text-neutral-500 dark:text-neutral-400">
      <div className="text-companyPrimary">{icon}</div>
      <span>{label}</span>
      <span className="dark:text-neutral-300 font-bold">{data}</span>
    </div>
  )
}

export function SpanElementListBorder ({icon, label, data}) {
  return(
    <div className="flex flex-row border dark:border-neutral-800 border-neutral-400 rounded-md p-1 px-3 gap-1 items-center justify-start text-sm text-neutral-500 dark:text-neutral-400">
      <div className="text-companyPrimary">{icon}</div>
      <span>{label}</span>
      <span className="dark:text-neutral-300 font-bold">{data}</span>
    </div>
  )
}

export function HeaderAccount () {

    const { utente, azienda, checking } = useAdmin()
    const [openUpBar, setOpenUpBar] = useState(false)

    return(
        <>
        <div className={`${openUpBar ? "flex flex-row justify-end gap-10 dark:bg-neutral-950 bg-neutral-400 p-5" : "hidden"} `}>
            <div id="col-one" className="">
                <ThemeToggle/>
            </div>
        </div>
        <div className="flex lg:flex-row flex-col gap-3 justify-between items-center py-5 px-5 w-full bg-companyPrimary">
            <div id="logo-cnt" className="w-32">
                <img src={'/logo-white.png'} width={150} height={50} quality={20} alt="logo-company"/>
            </div>
            <div id="btn-cnt" className="flex flex-row items-center justify-end gap-3 px-7">
                <span className="text-xs text-neutral-300 rounded-lg max-h-full">{utente?.email}</span>
                <PlusButton open={() => setOpenUpBar(prev => !prev)}/>
                <LogoutButton/>
            </div>
        </div>
        </>
    )
}