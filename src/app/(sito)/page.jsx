'use client'

import { Header, Footer } from "@/app/componenti-sito/theme";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const address = "Contrada Pagliarone SNC - Zona ASI - 80011 Acerra";

  const googleMapsEmbedSrc = useMemo(() => {
    // Embed semplice senza API key (query address)
    const q = encodeURIComponent("Ecocar Autodemolizione");
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Inserisci il nome.";
    if (!form.phone.trim()) return "Inserisci un numero di telefono.";
    if (!form.email.trim()) return "Inserisci un’email.";
    if (!form.message.trim()) return "Scrivi un messaggio.";
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "landing-ecocar",
          company: "", // honeypot
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        throw new Error(json?.message || "Invio non riuscito");
      }

      toast.success("Messaggio inviato! Ti ricontatteremo al più presto.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Errore durante l’invio. Riprova tra poco.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
    <main className="min-h-dvh bg-white text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden bg-neutral-100">
        <div className="flex lg:flex-row flex-col mx-auto max-w-6xl px-4 py-14 md:py-20 gap-6">
          <div className="">
            <Image src={"/banner2-home.jpeg"} width={800} height={800} className="max-w-full object-cover rounded-2xl" alt="banner2-home"/>
          </div>
          <div id="chi-siamo" className="max-w-2xl">
            <Image src={"/assets/logo-color.png"} alt="Ecocar Autodemolizione" width={1500} height={100} className="w-48 h-auto mb-4" sizes="(max-width: 640px) 96px, 160px"/>
            <p className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-neutral-900">
              <span className="h-2 w-2 rounded-full bg-companyPrimary" />
              Oltre 20 anni di esperienza
            </p>

            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-400">
              Ecocar <span className="text-companyPrimary">Autodemolizione</span>
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Rottamazione veicoli e vendita ricambi auto usati garantiti ad Acerra (NA).
              Un servizio rapido, trasparente e professionale per privati e aziende.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="#contatti"
                className="inline-flex items-center justify-center rounded-md bg-companyPrimary px-5 py-3 text-sm font-semibold hover:opacity-90"
              >
                Contattaci ora
              </a>

              <a
                href="#mappa"
                className="inline-flex items-center justify-center rounded-md border border-companySecondary px-5 py-3 text-sm font-semibold hover:bg-companySecondary hover:text-white text-companyPrimary"
              >
                Vedi la sede
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex items-center justify-center h-80 bg-[url('/banner-home.png')] bg-cover bg-center bg-no-repeat bg-neutral-950">
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Ecocar <span className="text-companySecondary">Autodemolizione</span>
        </h1>
      </section>
      {/* CHI SIAMO */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-12 items-start">
          <div className="md:col-span-7">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-companyPrimary">Chi siamo</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Ecocar Autodemolizione opera da oltre 20 anni nel settore della rottamazione dei veicoli fuori uso,
              affermandosi come realtà affidabile e professionale nel territorio campano.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Con sede ad Acerra, Zona Industriale, ci occupiamo della rottamazione e demolizione di ogni tipologia
              di veicolo nel pieno rispetto delle normative ambientali vigenti.
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-2xl border border-companyPrimary p-5 bg-card shadow-sm bg-white">
              <p className="text-sm font-semibold text-companyPrimary">In breve</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-companyPrimary" />
                  Servizio rapido e trasparente
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-companyPrimary" />
                  Supporto a privati e aziende
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-companyPrimary" />
                  Ricambi auto usati garantiti
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-companyPrimary" />
                  Rispetto normative ambientali
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIZI */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-companyPrimary p-6 bg-card shadow-sm bg-companyPrimary">
            <h3 className="text-lg font-bold text-white">Rottamazione e demolizione veicoli</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-neutral-300">
              Gestiamo rottamazione e demolizione di ogni tipologia di veicolo, con un servizio completo
              e chiaro in ogni fase.
            </p>
          </div>

          <div className="rounded-2xl border border-companySecondary p-6 bg-card shadow-sm bg-companySecondary">
            <h3 className="text-lg font-bold">Ricambi auto usati garantiti</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-neutral-300">
              Disponiamo di ricambi auto usati selezionati e garantiti, una soluzione conveniente e affidabile
              per manutenzioni e riparazioni.
            </p>
          </div>
        </div>
      </section>
 
      {/* MAPPA */} 
      <section id="mappa" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-companyPrimary">Dove siamo</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sede: <span className="text-foreground font-medium text-neutral-500">{address}</span>
            </p>
          </div>

          <a
            className="text-sm font-semibold text-companyPrimary hover:underline"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Apri su Google Maps →
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <iframe
            title="Mappa Ecocar Autodemolizione"
            src={googleMapsEmbedSrc}
            className="h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* CONTATTI + FORM */}
      <section id="contatti" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-12 items-start">
          <div className="md:col-span-5">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-companyPrimary">Contatti</h2>

            <div className="mt-4 rounded-2xl border p-5 bg-card shadow-sm bg-white">
              <p className="text-sm font-semibold text-neutral-600">Recapiti</p>

              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Sede</p>
                  <p className="font-medium text-neutral-600">{address}</p>
                </div>

                <div className="grid gap-3">
                  <div>
                    <p className="text-muted-foreground">Cellulare Rottamazione</p>
                    <a className="font-medium hover:underline text-neutral-600" href="tel:+39375858112">
                      375 858 1112
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cellulare Ricambi Auto</p>
                    <a className="font-medium hover:underline text-neutral-600" href="tel:+393757401160">
                      375 740 1160
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a className="font-medium hover:underline text-neutral-600" href="mailto:ecocar.cavagnoli@gmail.com">
                      ecocar.cavagnoli@gmail.com
                    </a>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Preferisci una risposta rapida? Lascia telefono e richiesta: ti ricontattiamo appena possibile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-2xl border p-6 bg-card shadow-sm bg-white">
              <h3 className="text-lg font-bold text-companySecondary">Richiedi informazioni</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Compila il modulo e inviaci la tua richiesta. Ti rispondiamo al più presto.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600">Nome e Cognome</label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Es. Mario Rossi"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-600">Telefono</label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="Es. 333 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600">Email</label>
                  <Input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Es. nome@email.it"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600">Messaggio</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    placeholder="Scrivi qui la tua richiesta (rottamazione, ricambi, info...)"
                    className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-companyPrimary bg-white"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-companyPrimary">
                  <Button type="submit" disabled={loading} className="bg-companyPrimary text-white hover:bg-companySecondary">
                    {loading ? "Invio..." : "Invia richiesta"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm({ name: "", phone: "", email: "", message: "" })}
                    disabled={loading}
                  >
                    Svuota
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground pt-2">
                  Inviando accetti che i tuoi dati vengano usati solo per rispondere alla richiesta.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>


    </main>
    </>
  );
}
