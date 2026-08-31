'use client'

import { useState } from "react";
import InserimentoVeicoliRitirati from "./ritiroVeicoli";
import ElencoVeicoliRitirati from "./elencoVeicoliRitirati";
import PAGEveicoliAttesaRitiro from "./veicoliAttesaRitiro";
import ModificaPratica from "./modificaPratica";
import FotoVeicoliRitirati from "./fotoVeicoli";
import CercaTarga from "./cercaTarga";
import { useAdmin } from "@/app/admin/components/AdminContext";
import { TiThMenu } from "react-icons/ti";
import { GrFormClose } from "react-icons/gr";

export default function PAGEritiriDemolizioni() {

  const utente = useAdmin()
  const role = utente?.utente?.user_metadata?.ruolo
  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState(false)
  const [onDisplaySectionTwo, setOnDisplaySectionTwo] = useState(true)
  const [onDisplaySectionThree, setOnDisplaySectionThree] = useState(false)
  const [onDisplaySectionFour, setOnDisplaySectionFour] = useState(false)
  const [onDisplaySectionFive, setOnDisplaySectionFive] = useState(false)
  const [onDisplaySectionSix, setOnDisplaySectionSix] = useState(false)
  const [statusAziende, setStatusAziende] = useState(false)
  const [open, setOpen] = useState(false)

  function ClickSectionOne () {
    setOnDisplaySectionOne(true)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOnDisplaySectionFive(false)
    setOnDisplaySectionSix(false)
    setOpen(false)
  }

  function ClickSectionTwo () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(true)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOnDisplaySectionFive(false)
    setOnDisplaySectionSix(false)
    setOpen(false)
  }

  function ClickSectionThree () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(true)
    setOnDisplaySectionFour(false)
    setOnDisplaySectionFive(false)
    setOnDisplaySectionSix(false)
    setOpen(false)
  }

  function ClickSectionFour () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(true)
    setOnDisplaySectionFive(false)
    setOnDisplaySectionSix(false)
    setOpen(false)
  }

  function ClickSectionFive () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOnDisplaySectionFive(true)
    setOnDisplaySectionSix(false)
    setOpen(false)
  }

  function ClickSectionSix () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(false)
    setOnDisplaySectionThree(false)
    setOnDisplaySectionFour(false)
    setOnDisplaySectionFive(false)
    setOnDisplaySectionSix(true)
    setOpen(false)
  }

  function ClickMenu () {
    setOpen(prev => !prev)
  }

  const isAdmin = role == 'admin' || role == 'superadmin'
  const isCompany = role == 'company'

  return (
    <>
    <div className="flex flex-col min-h-0 w-full justify-start items-start overflow-auto gap-3">
      <div className="flex flex-col lg:items-start items-center lg:justify-start justify-center w-full gap-3">
        <ButtonMenu click={ClickMenu} nome="MENU" section={onDisplaySectionOne} open={open} icon={<TiThMenu/>} iconTwo={<GrFormClose />}/>
        <div className={`${!open ? "hidden" : ""} dark:bg-neutral-950 bg-neutral-200 transition-all p-3 rounded-lg flex lg:flex-row flex-wrap w-full gap-3`}>
          {isAdmin || isCompany ? <ButtonSection click={ClickSectionOne} nome="INSERIMENTO RITIRO VEICOLO" section={onDisplaySectionOne}/> : null}
          {isAdmin || isCompany ? <ButtonSection click={ClickSectionTwo} nome="ELENCO RITIRI" section={onDisplaySectionTwo}/> : null}
          {/* {isAdmin || isCompany ? <ButtonSection click={ClickSectionSix} nome="FOTO VEICOLI" section={onDisplaySectionSix}/> : null} */}
          {isAdmin ? <ButtonSection click={ClickSectionThree} nome="ATTESA DI RITIRO" section={onDisplaySectionThree}/> : null}
          {isAdmin ? <ButtonSection click={ClickSectionFour} nome="MODIFICA PRATICA" section={onDisplaySectionFour}/> : null}
          {isAdmin ? <ButtonSection click={ClickSectionFive} nome="CERCA TARGA" section={onDisplaySectionFive}/> : null}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-brand to-brandDark"/>
      <div className="flex flex-1 justify-start items-start w-full min-h-0">
        {isAdmin || isCompany ? <InserimentoVeicoliRitirati statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionOne}/> : null}
        {isAdmin || isCompany ? <ElencoVeicoliRitirati statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionTwo}/> : null}
        {/* {isAdmin || isCompany ? <FotoVeicoliRitirati statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionSix}/> : null} */}
        {isAdmin ? <PAGEveicoliAttesaRitiro statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionThree}/> : null }
        {isAdmin ? <ModificaPratica statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionFour}/> : null }
        {isAdmin ? <CercaTarga statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionFive}/> : null }
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