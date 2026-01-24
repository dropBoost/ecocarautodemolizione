'use client'

import { useState } from "react";
import SECTIONgestioneTrasporto from '@/app/gestionale/(applicativi)/gestione-trasporto/componenti/gestioneTrasporto';
import SECTIONautistiCamion from '@/app/gestionale/(applicativi)/gestione-trasporto/componenti/autistiCamion';
import { TiThMenu } from "react-icons/ti";
import { GrFormClose } from "react-icons/gr";

export default function PAGEgestioneTrasportoVeicoli() {

  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState(true)
  const [onDisplaySectionTwo, setOnDisplaySectionTwo] = useState(false)
  const [statusAziende, setStatusAziende] = useState(false)
  const [open, setOpen] = useState(false)

  function ClickSectionOne () {
    setOnDisplaySectionOne(true)
    setOnDisplaySectionTwo(false)
    setOpen(false)
  }
  function ClickSectionTwo () {
    setOnDisplaySectionOne(false)
    setOnDisplaySectionTwo(true)
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
          <ButtonSection click={ClickSectionOne} nome="GESTIONE TRASPORTO" section={onDisplaySectionOne}/>
          {/* <ButtonSection click={ClickSectionTwo} nome="AUTISTI" section={onDisplaySectionTwo}/> */}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-brand to-brandDark"/>
      <div className="flex flex-1 justify-start items-start w-full min-h-0">
        <SECTIONgestioneTrasporto statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionOne}/>
        {/* <SECTIONautistiCamion statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionTwo}/> */}
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