'use client'

import { useState } from "react";
import InserimentoModelliVeicoli from "./inserimentoModelliVeicoli";

export default function ModelliVeicoliPAGE () {

  const [onDisplaySectionOne, setOnDisplaySectionOne] = useState("on")

  const [statusAziende, setStatusAziende] = useState(false)

  function ClickSectionOne () {
    setOnDisplaySectionOne("on")
  }

  return (
    <>
    <div className="flex flex-col min-h-0 w-full justify-start items-start overflow-auto gap-3">
      <div className="flex items-start md:justify-start justify-center w-full gap-3">
        <ButtonSection click={ClickSectionOne} nome="INSERIMENTO MODELLI VEICOLI" section={onDisplaySectionOne}/>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-brand to-brandDark"/>
      <div className="flex flex-1 justify-start items-start w-full min-h-0">
        <InserimentoModelliVeicoli statusAziende={statusAziende} setStatusAziende={setStatusAziende} onDisplay={onDisplaySectionOne}/>
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
      ${section === "on" ? `text-neutral-100 bg-brand  border-brand` : `text-brand border border-brand`}
      `}
      >{nome}</button>
    </>
  )
}