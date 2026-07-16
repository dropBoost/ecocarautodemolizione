"use client";

import SECTIONveicoliRitiratiTrasporto from "./componenti/veicoliRitiratiTrasporto";
import { useAdmin } from "@/app/admin/components/AdminContext";

export default function PAGEnotificheTrasportoVeicoli() {

  const utente = useAdmin()
  const role = utente?.utente?.user_metadata?.ruolo
   
  return (
    <>
      <div className="flex flex-col min-h-0 w-full justify-start items-start overflow-auto gap-3">
        <div className="flex flex-col lg:items-start items-center lg:justify-start justify-center w-full gap-3">
          <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
            NOTIFICHE
          </h4>
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-brand to-brandDark" />
        <div className="flex flex-1 justify-start items-start w-full min-h-0">
          {role == "admin" || role == "transporter" || role == "superadmin" ? <SECTIONveicoliRitiratiTrasporto utente={utente} /> : null }
        </div>
      </div>
    </>
  );
}