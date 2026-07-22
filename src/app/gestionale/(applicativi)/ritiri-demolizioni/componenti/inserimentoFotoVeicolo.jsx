"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

const CAMPI_FOTO = [
  {
    campo: "foto_anteriore",
    label: "Foto anteriore",
  },
  {
    campo: "foto_posteriore",
    label: "Foto posteriore",
  },
  {
    campo: "foto_laterale_sx",
    label: "Foto laterale sinistra",
  },
  {
    campo: "foto_laterale_dx",
    label: "Foto laterale destra",
  },
  {
    campo: "foto_aggiuntiva_uno",
    label: "Foto aggiuntiva 1",
  },
  {
    campo: "foto_aggiuntiva_due",
    label: "Foto aggiuntiva 2",
  },
];

export default function CaricaFotoVeicolo({ uuidVeicoloRitirato, targa, onSuccess, setUpdateFoto }) {

  const [foto, setFoto] = useState({});
  const [anteprime, setAnteprime] = useState({});
  const [caricamento, setCaricamento] = useState(false);

  function selezionaFoto(campo, file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Puoi caricare solamente immagini");
      return;
    }

    const dimensioneMassima = 6 * 1024 * 1024;

    if (file.size > dimensioneMassima) {
      toast.error("La foto non può superare i 6 MB");
      return;
    }

    setFoto((precedenti) => ({
      ...precedenti,
      [campo]: file,
    }));

    setAnteprime((precedenti) => {
      if (precedenti[campo]) {
        URL.revokeObjectURL(precedenti[campo]);
      }

      return {
        ...precedenti,
        [campo]: URL.createObjectURL(file),
      };
    });
  }

  async function caricaFoto() {
    if (!uuidVeicoloRitirato) {
      toast.error("UUID del veicolo non disponibile");
      return;
    }

    const fotoSelezionate = Object.entries(foto);

    if (fotoSelezionate.length === 0) {
      toast.error("Seleziona almeno una foto");
      return;
    }

    setCaricamento(true);

    try {
      const datiFotoDaSalvare = {
        uuid_veicolo_ritirato: uuidVeicoloRitirato,
      };

      for (const [campo, file] of fotoSelezionate) {
        const estensione =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const percorsoFile = `${uuidVeicoloRitirato}/${targa}-${campo}.${estensione}`;

        const { error: uploadError } = await supabase.storage
          .from("fotoveicoli")
          .upload(percorsoFile, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(
            `Errore nel caricamento di ${campo}: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("fotoveicoli")
          .getPublicUrl(percorsoFile);

        datiFotoDaSalvare[campo] = publicUrlData.publicUrl;
      }

      const { data: fotoEsistente, error: ricercaError } =
        await supabase
          .from("veicolo_ritirato_foto")
          .select("id")
          .eq("uuid_veicolo_ritirato", uuidVeicoloRitirato)
          .maybeSingle();

      if (ricercaError) {
        throw ricercaError;
      }

      let databaseError;

      if (fotoEsistente?.id) {
        const { error } = await supabase
          .from("veicolo_ritirato_foto")
          .update(datiFotoDaSalvare)
          .eq("id", fotoEsistente.id);

        databaseError = error;
      } else {
        const { error } = await supabase
          .from("veicolo_ritirato_foto")
          .insert(datiFotoDaSalvare);

        databaseError = error;
      }

      if (databaseError) {
        throw databaseError;
      }

      toast.success("Foto del veicolo caricate correttamente");

      setFoto({});
      setAnteprime({});
      setUpdateFoto(prev=>prev+1)

      onSuccess?.(datiFotoDaSalvare);
    } catch (error) {
      console.error("Errore caricamento foto:", error);

      toast.error(
        error?.message || "Errore durante il caricamento delle foto"
      );
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg">
      <div className="grid gap-4 grid-cols-2">
        {CAMPI_FOTO.map(({ campo, label }) => (
          <div key={campo} className="flex flex-col gap-2 rounded-lg border p-3">
            <Label htmlFor={campo}>{label}</Label>

            {anteprime[campo] && (
              <div className="relative aspect-video overflow-hidden rounded-md border">
                <Image
                  src={anteprime[campo]}
                  alt={label}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <Input
              id={campo}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={caricamento}
              onChange={(event) =>
                selezionaFoto(campo, event.target.files?.[0])
              }
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        onClick={caricaFoto}
        disabled={
          caricamento ||
          !uuidVeicoloRitirato ||
          Object.keys(foto).length === 0
        }
        className="w-fit"
      >
        {caricamento ? (
          <>
            <Loader2 className="animate-spin" />
            Caricamento...
          </>
        ) : (
          <>
            <Upload />
            Carica foto
          </>
        )}
      </Button>
    </div>
  );
}