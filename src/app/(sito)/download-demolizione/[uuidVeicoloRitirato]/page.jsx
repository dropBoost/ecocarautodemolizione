'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Timeline, PickDotColor } from "@/app/componenti-sito/trackerStatus";
import { SpanElementList } from "@/app/componenti-sito/theme";
import { FaCaretRight, FaCarAlt, FaUser, FaBuilding, FaFileDownload } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { DataFormat } from "@/app/componenti-sito/dataFormat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

export default function StatusDemolizione() {
  const params = useParams();

  const uuidVeicoloRitirato = params?.uuidVeicoloRitirato;
  const [veicoloDemolito, setVeicoloDemolito] = useState([]);
  const [veicoloRitirato, setVeicoloRitirato] = useState([]);
  const [statoAvanzamento, setStatoAvanzamento] = useState([]);

  const datiVeicolo = veicoloRitirato?.[0] || null;

  // CARICAMENTO DATI VEICOLO
  useEffect(() => {
    if (!uuidVeicoloRitirato) return;

    (async () => {
      const { data, error } = await supabase
        .from("dati_veicolo_ritirato")
        .select(`
          *,
          azienda_ritiro_veicoli:azienda_ritiro_veicoli (*),
          modello_veicolo:modello_veicolo (*)
        `)
        .eq("uuid_veicolo_ritirato", uuidVeicoloRitirato);

      if (error) {
        console.log(error);
        return;
      }

      setVeicoloRitirato(data ?? []);
    })();
  }, [uuidVeicoloRitirato]);

  // CARICAMENTO LOG AVANZAMENTO
  useEffect(() => {
    if (!datiVeicolo?.uuid_veicolo_ritirato) return;

    (async () => {
      const { data, error } = await supabase
        .from("log_avanzamento_demolizione")
        .select(`
          *,
          stato:stati_avanzamento(alias_stato_avanzamento)
        `)
        .eq("uuid_veicolo_ritirato", datiVeicolo.uuid_veicolo_ritirato)
        .order("created_at_stato_avanzamento", { ascending: false });

      if (error) {
        console.log("AVANZAMENTO PRATICA:", { error });
        return;
      }

      setStatoAvanzamento(data ?? []);
    })();
  }, [datiVeicolo?.uuid_veicolo_ritirato]);

  // CARICAMENTO DEMOLIZIONE
  useEffect(() => {
    if (!datiVeicolo?.pratica_completata) return;

    (async () => {
      const { data, error } = await supabase
        .from("certificato_demolizione")
        .select(`*`)
        .eq("uuid_veicolo_ritirato", uuidVeicoloRitirato);

      if (error) {
        console.log(error);
        return;
      }

      setVeicoloDemolito(data ?? []);
    })();
  }, [datiVeicolo?.pratica_completata, uuidVeicoloRitirato]);

  if (!veicoloRitirato.length) {
    return (
      <div className="w-full h-full px-4 py-6 md:px-6 md:py-8 bg-neutral-300">
        <div className="mx-auto max-w-7xl h-full">
          <div className="rounded-3xl border border-neutral-200 bg-companyPrimary px-6 py-10 text-sm text-neutral-600 shadow-sm dark:border-neutral-800  dark:text-neutral-300">
            ...attendi
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full px-4 py-4 md:px-6 md:py-6 lg:h-full bg-neutral-200">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px] justify-center lg:h-full">
        {/* COLONNA SINISTRA */}
        <div className="min-w-0 rounded-3xl bg-neutral-50 p-4 shadow-xl md:p-5 lg:h-full">
          <div className="flex flex-col gap-5">
            {/* HEADER STATUS */}
            <div className="rounded-2xl bg-companyPrimary px-4 py-4 text-neutral-100">
              <h3 className="text-sm font-medium md:text-base">
                STATUS DEMOLIZIONE:{" "}
                <span className="font-bold">
                  {datiVeicolo?.targa_veicolo_ritirato}
                </span>
              </h3>
            </div>

            {/* ACCORDION DATI */}
            <div className="rounded-2xl bg-neutral-200 p-4 md:p-5">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-neutral-700 text-companyPrimary">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2 text-left text-sm md:text-base">
                      <FaCarAlt className="text-companyPrimary shrink-0" />
                      DATI VEICOLO
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 text-sm">
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Modello:"
                        data={`${datiVeicolo?.modello_veicolo?.marca || ""} ${datiVeicolo?.modello_veicolo?.modello || ""}`}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Documento:"
                        data={datiVeicolo?.tipologia_documento_veicolo_ritirato}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Anno Immatricolazione:"
                        data={datiVeicolo?.anno_veicolo_ritirato}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Cilindrata:"
                        data={datiVeicolo?.cilindrata_veicolo_ritirato}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="KM:"
                        data={datiVeicolo?.km_veicolo_ritirato}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border-neutral-700 text-companyPrimary">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2 text-left text-sm md:text-base">
                      <FaUser className="text-companyPrimary shrink-0" />
                      DATI DETENTORE VEICOLO
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 text-sm">
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Detentore Veicolo:"
                        data={`${datiVeicolo?.nome_detentore || ""} ${datiVeicolo?.cognome_detentore || ""}`}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Tipologia Detentore:"
                        data={datiVeicolo?.tipologia_detentore}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Nazionalità:"
                        data={datiVeicolo?.nazionalita_documento_detentore}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Documento Detentore:"
                        data={`${datiVeicolo?.tipologia_documento_detentore || ""} n° ${datiVeicolo?.numero_documento_detentore || ""}`}
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Indirizzo Detentore:"
                        data={`${datiVeicolo?.indirizzo_detentore || ""} - ${datiVeicolo?.cap_detentore || ""} ${datiVeicolo?.citta_detentore || ""} ${datiVeicolo?.provincia_detentore || ""}`}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border-neutral-700 text-companyPrimary">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2 text-left text-sm md:text-base">
                      <FaBuilding className="text-companyPrimary shrink-0" />
                      DATI AZIENDA RITIRO
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1 text-sm">
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Ritirato da:"
                        data="Ecocar Autodemolizione"
                      />
                      <SpanElementList
                        icon={<FaCaretRight />}
                        label="Data Ritiro Veicolo:"
                        data={DataFormat(datiVeicolo?.created_at_veicolo_ritirato)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* TIMELINE / DOWNLOAD */}
            <div className="rounded-2xl bg-companyPrimary px-4 py-5 md:px-6 md:py-6 ">
              {veicoloDemolito.length === 0 ? (
                <>
                  <div className="mb-5 rounded-xl bg-companyPrimary p-3 text-neutral-100">
                    <h3 className="text-xs font-medium md:text-sm">
                      STATO AVANZAMENTO DEMOLIZIONE
                    </h3>
                  </div>

                  <Timeline
                    items={(statoAvanzamento ?? []).map((t) => ({
                      id: t.uuid_log_avanzamento_demolizione,
                      title: t?.stato?.alias_stato_avanzamento || "Stato",
                      datetime: t.created_at_stato_avanzamento,
                      description: t.note_log_stato_avanzamento,
                      dotClassName: PickDotColor(t?.stato?.alias_stato_avanzamento || "")
                    }))}
                    className="ml-1 md:ml-2"
                  />
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-200">
                    Scarica il certificato di demolizione
                  </span>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {veicoloDemolito[0]?.documento_demolizione && (
                      <a
                        href={veicoloDemolito[0].documento_demolizione}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-companyPrimary transition hover:bg-companyPrimary hover:text-white"
                      >
                        <FaFileDownload />
                        CERTIFICATO
                      </a>
                    )}

                    {veicoloDemolito[0]?.altro_documento_demolizione && (
                      <a
                        href={veicoloDemolito[0].altro_documento_demolizione}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-companyPrimary transition hover:bg-companyPrimary hover:text-white"
                      >
                        <FaFileDownload />
                        ALTRO DOCUMENTO
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA - RECENSIONE */}
        <aside className="min-w-0 lg:h-full">
          <div className="rounded-3xl bg-companyPrimary p-4 shadow-xl md:p-5 xl:sticky xl:top-6">
            <div className="flex flex-col gap-6 rounded-2xl bg-neutral-200/10 p-6 text-left shadow-sm md:p-8">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-100">
                  La tua opinione conta
                </p>
                <div className="flex flex-row items-center w-full gap-3 h-full">
                  <span className="border border-yellow-500 h-full p-3 rounded-full">
                    <FaRankingStar className="text-yellow-500 text-3xl"/>
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Lascia una recensione su Google
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600 md:text-base dark:text-zinc-300">
                  Se hai avuto un’esperienza con{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    Autodemolizione Ecocar Acerra
                  </span>
                  , dedica un minuto a condividere il tuo feedback.
                  La tua recensione ci aiuta a migliorare e a offrire un servizio
                  sempre più affidabile e trasparente.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3">
                <a
                  href="https://g.page/r/CRUd8q4om1BsEBE/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-companySecondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-companyPrimary sm:w-auto"
                >
                  Scrivi una recensione
                </a>

                <p className="text-xs text-neutral-100">
                  Grazie per il tempo che vorrai dedicarci
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}