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
        <div className="flex lg:flex-row flex-row gap-3 justify-between items-center py-5 lg:px-10 px-5 w-full bg-companyPrimary">
            <div id="logo-cnt" className="max-w-24 lg:max-w-48">
                <Image src={'/assets/logo-white.png'} width={150} height={50} quality={100} alt="logo-company" className="lg:max-w-48 max-w-24"/>
            </div>
            <nav className="flex flex-row justify-center items-center flex-1">
							<ul className="flex flex-row text-xs text-white gap-3">
								<Link href={"/#chi-siamo"} className="hover:text-companySecondary hover:bg-white hover:px-3 py-1 rounded-md">CHI SIAMO</Link>
								<Link href={"/#contatti"} className="hover:text-companySecondary hover:bg-white hover:px-3 py-1 rounded-md">CONTATTI</Link>
							</ul>
            </nav>
            <div id="btn-cnt" className="flex flex-row items-center justify-between gap-3 px-7">
							<Link href="/download-demolizione" className="bg-neutral-100 text-xl dark:text-neutral-900 px-2 py-1 rounded-md"><MdCloudDownload/></Link>
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