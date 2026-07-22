'use client'
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAdmin } from "@/app/admin/components/AdminContext";
import TargaDesign from "@/app/componenti/targaDesign"
import { DialogInserimentoFotoTrasporti } from "./dialogInserimentoFotoTrasporti"
import Link from "next/link"
import { toast } from "sonner"
import { FaTrash } from "react-icons/fa";

export default function FotoVeicoliRitiratiTrasporto({ onDisplay, statusAziende, setStatusAziende }) {

  const utente = useAdmin()
  const role = utente?.utente?.user_metadata?.ruolo
  const uuidUtente = utente?.utente?.id
  const [datiVeicoloRitirato, setDatiVeicoloRitirato] = useState([])
  const [dataSearch, setDataSearch] = useState("")        // testo digitato
  const [dataSearchSubmit, setDataSearchSubmit] = useState("") // testo applicato
  const [updateFoto, setUpdateFoto] = useState(0)
  const isAdmin = role === "admin" || role === "superadmin"
  const isTrasporter = role === "transporter"
  const isCompany = role === "company"

  const escapeLike = (s) => s.replace(/([%_\\])/g, "\\$1")

  function handleChangeSearchBar(e) {
    setDataSearch(e.target.value)
  }
  function handleSearchClick() {
    setDataSearchSubmit(dataSearch.trim())
  }
  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      setDataSearchSubmit(dataSearch.trim())
    }
  }
  function handleReset() {
    setDataSearch("")
    setDataSearchSubmit("")
  }

  const eliminaVeicoloFoto = async (uuid) => {
    if (!uuid) {
      toast.error("UUID del veicolo non valido");
      return;
    }

    try {
      // 1. Recupera tutti i file presenti nella cartella fotoveicoli/${uuid}
      const { data: files, error: listError } = await supabase.storage
        .from("fotoveicoli")
        .list(uuid, {
          limit: 100,
        });

      if (listError) {
        throw new Error(`Errore nel recupero delle foto: ${listError.message}`);
      }

      // 2. Elimina tutti i file trovati
      if (files?.length) {
        const filePaths = files
          .filter((file) => file.id) // esclude eventuali sottocartelle
          .map((file) => `${uuid}/${file.name}`);

        if (filePaths.length) {
          const { error: storageError } = await supabase.storage
            .from("fotoveicoli")
            .remove(filePaths);

          if (storageError) {
            throw new Error(
              `Errore durante l'eliminazione delle foto: ${storageError.message}`
            );
          }
        }
      }

      // 3. Elimina il record dalla tabella delle foto
      const { error: databaseError } = await supabase
        .from("veicolo_ritirato_foto")
        .delete()
        .eq("uuid_veicolo_ritirato", uuid);

      if (databaseError) {
        throw new Error(
          `Errore durante l'eliminazione del record: ${databaseError.message}`
        );
      }

      // 4. Aggiorna eventualmente lo stato locale
      setDatiVeicoloRitirato((prev) =>
        prev.filter((veicolo) => veicolo.uuid_veicolo_ritirato !== uuid)
      );

      toast.success("Foto eliminate correttamente");
      setUpdateFoto(prev => prev+1)
    } catch (error) {
      console.error("Errore eliminazione:", error);
      toast.error(error.message || "Errore durante l'eliminazione");
    }
  };

  useEffect(() => {

    if (!role) return
    if ((!isAdmin || isTrasporter) && !uuidUtente) return

    const fetchData = async () => {
      let query = supabase
        .from("dati_veicolo_ritirato")
        .select(
          ` uuid_veicolo_ritirato,
            uuid_azienda_ritiro_veicoli,
            targa_veicolo_ritirato,
            created_at_veicolo_ritirato,
            pratica_completata,
            veicolo_ritirato,
            demolizione_approvata,
            azienda:azienda_ritiro_veicoli(uuid_azienda_ritiro_veicoli, ragione_sociale_arv),
            modello:modello_veicolo(marca, modello),
            foto_veicolo:veicolo_ritirato_foto(*)
          `,
          { count: "exact" }
        )
        .order("created_at_veicolo_ritirato", { ascending: true })
        .eq("pratica_completata", false)
        .eq("veicolo_ritirato", false)
        .or("demolizione_approvata.eq.true,demolizione_approvata.is.null")


      if (dataSearchSubmit) {
        const q = escapeLike(dataSearchSubmit)
        query = query.or(`targa_veicolo_ritirato.ilike.%${q}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Errore:", error)
        setDatiVeicoloRitirato([])
        return
      }

      setDatiVeicoloRitirato(data ?? [])
      
    }

    fetchData()
  }, [ role, uuidUtente, isAdmin, isTrasporter, isCompany, dataSearchSubmit, statusAziende, updateFoto ])

  return (
    <div className={`${onDisplay === true ? '' : 'hidden'} w-full h-full flex-1 flex flex-col md:p-0 md:pe-3 px-4 gap-4`}>
      {/* Barra ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          id="cerca"
          placeholder="Cerca targa…"
          value={dataSearch}
          onChange={handleChangeSearchBar}
          onKeyDown={handleSearchKeyDown}
          className="appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand
                     focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand placeholder:text-xs placeholder:text-neutral-500 placeholder:italic"
        />
        <Button type="button" onClick={handleSearchClick}>Cerca</Button>
        <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
      </div>
      <div className="flex flex-col gap-3">
        {datiVeicoloRitirato.length > 0 ? (
          datiVeicoloRitirato.map((dv) => {
            const foto = dv?.foto_veicolo?.[0]

            const immagini = [
              foto?.foto_anteriore,
              foto?.foto_posteriore,
              foto?.foto_laterale_sx,
              foto?.foto_laterale_dx,
              foto?.foto_aggiuntiva_uno,
              foto?.foto_aggiuntiva_due,
            ].filter(Boolean)

            return (
              <div key={dv?.uuid_veicolo_ritirato} className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex flex-row items-center gap-2">
                  <span className="text-xs">
                    {dv?.azienda?.ragione_sociale_arv}
                  </span>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <span className="min-w-36 text-sm font-bold">
                    <TargaDesign targa={dv?.targa_veicolo_ritirato} />
                  </span>
                </div>

                <div className="flex w-fit flex-row items-center gap-1 rounded bg-brand px-3 py-1 font-bold text-neutral-950">
                  <span className="text-xs">{dv?.modello?.marca}</span>
                  <span className="text-xs">{dv?.modello?.modello}</span>
                </div>

                {immagini.length > 0 ? (
                  <div className="flex w-fit flex-row flex-wrap items-center gap-2 rounded border border-brand px-3 py-1">
                    {immagini.map((src, index) => (
                      <Link href={`${src}?download`} target="_blank" key={`${dv.uuid_veicolo_ritirato}-${index}`}>
                        <Image
                          src={src}
                          alt={`Foto veicolo ${index + 1}`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                          unoptimized
                        />
                      </Link>
                    ))}
                    {isAdmin &&
                    <div className="flex flex-row gap-3">
                    <DialogInserimentoFotoTrasporti
                      uuidVeicoloRitirato={dv?.uuid_veicolo_ritirato} targa={dv?.targa_veicolo_ritirato} setUpdateFoto={setUpdateFoto}
                    />
                    <Button variant="icon" size="xs" onClick={() => eliminaVeicoloFoto(dv?.uuid_veicolo_ritirato)}>
                      <FaTrash className=""/>
                    </Button>
                    </div>
                    }
                  </div>
                ) : (
                  <DialogInserimentoFotoTrasporti
                    uuidVeicoloRitirato={dv?.uuid_veicolo_ritirato} targa={dv?.targa_veicolo_ritirato} setUpdateFoto={setUpdateFoto}
                  />
                )}
              </div>
            )
          })
        ) : (
          <span className="h-24 text-center">
            Nessun risultato.
          </span>
        )}
      </div>
    </div>
          )
        }





