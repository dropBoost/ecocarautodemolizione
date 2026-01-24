'use client'

import { useState } from "react";

import InserimentoCertificatiDemolizione from "./inserimentoCertificatoDemolizione";
import ElencoCertificatiDemolizione from "./elencoCertificatiDemolizione";
import CercaDemolizioneTarga from "./cercaTarga";
import { useAdmin } from "@/app/admin/components/AdminContext";
import SECTIONradiazioniPRA from "./radiazionePRA";
import { TiThMenu } from "react-icons/ti";
import { GrFormClose } from "react-icons/gr";


export default function CertificatiDemolizione() {

  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState(true)
  const [onDisplaySectionTwo, setOnDisplaySectionTwo] = useState(false)
  const [onDisplaySectionThree, setOnDisplaySectionThree] = useState(false)
  const [onDisplaySectionFour, setOnDisplaySectionFour] = useState(false)
  const [statusAziende, setStatusAziende] = useState(false)
  const [statusPage, setStatusPage] = useState(false)
  const [open, setOpen] = useState(false)

  const utente = useAdmin()
  const role = utente?.utente?.user_metadata?.ruolo
  const isAdmin = role === "admin" || role === "superadmin"

  function ClickSectionOne () {
    setOnDisplaySectionOne(true)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOpen(false)
  }
  function ClickSectionTwo () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(true)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOpen(false)
  }
  function ClickSectionThree () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(true)
    setOnDisplaySectionFour(false)
    setOpen(false)
  }
  function ClickSectionFour () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(true)
    setOpen(false)
  }
  function ClickMenu () {
    setOpen(prev => !prev)
  }
  return (
    <>
    <div className="flex flex-col min-h-0 w-full justify-start items-start overflow-auto gap-3">
      <div className="flex flex-col lg:items-start items-center lg:justify-start justify-center w-full gap-3">
        <ButtonMenu click={ClickMenu} nome="MENU" section={onDisplaySectionOne} open={open} icon={<TiThMenu/>} iconTwo={<GrFormClose />}/>
        <div className={`${!open ? "hidden" : ""} dark:bg-neutral-950 bg-neutral-200 transition-all p-3 rounded-lg flex lg:flex-row flex-wrap w-full gap-3`}>
          {isAdmin ? <ButtonSection click={ClickSectionOne} nome="INSERIMENTO DEMOLIZIONE" section={onDisplaySectionOne}/> : "" }
          <ButtonSection click={ClickSectionTwo} nome="DEMOLIZIONI EFFETTUATE" section={onDisplaySectionTwo}/>
          {isAdmin ? <ButtonSection click={ClickSectionThree} nome="CERCA TARGA" section={onDisplaySectionThree}/> : ""}
          {isAdmin ? <ButtonSection click={ClickSectionFour} nome="RADIAZIONE PRA" section={onDisplaySectionFour}/> : ""}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-brand to-brandDark"/>
      <div className="flex flex-1 justify-start items-start w-full min-h-0">
        {isAdmin ? <InserimentoCertificatiDemolizione statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionOne}/> : ""}
        <ElencoCertificatiDemolizione statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionTwo}/>
        {isAdmin ? <CercaDemolizioneTarga statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionThree} sPage={statusPage} sSPage={setStatusPage}/> : ""}
        {isAdmin ? <SECTIONradiazioniPRA statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionFour} sPage={statusPage} sSPage={setStatusPage}/> : ""}
      </div>
    </div>
    </>
  );
}

export function ButtonSection ({section, nome, click}) {
  return (
    <>
    <button
      onClick={click}
      className={`
      flex items-center justify-center text-xs font-bold border rounded-2xl px-3 py-1 
      ${section === true ? `text-neutral-100 bg-brand  border-brand` : `text-brand border border-brand`}
      `}
      >{nome}</button>
    </>
  )
}

export function ButtonMenu ({section, nome, icon, iconTwo, click, open}) {
  return (
    <>
    <button onClick={click}
      className={`
      flex items-center justify-center text-xs font-bold border rounded-2xl px-3 py-1 gap-1 transition-all
      ${open === false ? `text-neutral-100 bg-brand  border-brand` : `text-brand border border-brand`}
      `}
      >{open ? <>{iconTwo} CHIUDI</> : <>{icon} {nome}</>}</button>
    </>
  )
}