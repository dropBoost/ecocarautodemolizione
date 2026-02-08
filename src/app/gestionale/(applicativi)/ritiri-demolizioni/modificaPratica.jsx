import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAdmin } from "@/app/admin/components/AdminContext";

export default function ModificaPratica({ onDisplay }) {
  const [praticaDemolizione, setPraticaDemolizione] = useState([]);

  const [dataSearch, setDataSearch] = useState("");
  const [dataSearchSubmit, setDataSearchSubmit] = useState("");

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

	const utente = useAdmin();
	const role = utente?.utente?.user_metadata?.ruolo;
	const isAdmin = role === "admin" || role === "superadmin";

  // === CONFIG ===

  // Campi da NON mostrare proprio nel form
  const HIDDEN_FIELDS = useMemo(
    () =>
      new Set([
        "uuid_azienda_ritiro_veicoli",
        "uuid_modello_veicolo",

        "foto_documento_veicolo_ritirato_f",
        "foto_documento_detentore_f",
        "foto_documento_veicolo_ritirato_r",
        "foto_documento_detentore_r",

        "pratica_eliminata",
        "pratica_completata",
        "demolizione_approvata",
        "veicolo_ritirato",
        "veicolo_consegnato",

        "foto_complementare_veicolo_ritirato_f",
        "foto_complementare_veicolo_ritirato_r",

        "azienda",
        "modello",
      ]),
    []
  );

  // Campi readonly (oltre ai default)
  const READONLY_FIELDS = useMemo(
    () =>
      new Set([
        "created_at_veicolo_ritirato",
        "azienda",
        "modello",

        "targa_veicolo_ritirato",
        "tipologia_detentore",
        "forma_legale_detentore",
        "uuid_veicolo_ritirato",

        "vin_veicolo_ritirato",
        "vin_legibile",
      ]),
    []
  );

  // Campi che NON vanno mostrati se vuoti
  const HIDE_IF_EMPTY = useMemo(
    () => new Set(["ragione_sociale_detentore", "piva_detentore", "cf_detentore"]),
    []
  );

  // Select options (form principale)
  const OPTIONS_TIPO_DOC_VEICOLO = useMemo(
    () => [
      { label: "Carta di Circolazione", value: "carta di circolazione" },
      { label: "Denuncia", value: "denuncia" },
    ],
    []
  );

  const OPTIONS_NAZIONALITA_DOC = useMemo(
    () => [
      { label: "Italiana", value: "it" },
      { label: "Europea", value: "eu" },
      { label: "Altro", value: "altro" },
    ],
    []
  );

  const OPTIONS_STATO_GRAVAMI = useMemo(
    () => [
      { label: "Buona Unico", value: "unico" },
      { label: "Buona Cartaceo", value: "cartaceo" },
      { label: "Buona Digitale", value: "digitale" },
    ],
    []
  );

  // === FORM CAMBIO MODELLO (marca + modello) ===
  const [modelli, setModelli] = useState([]);
  const [loadingModelli, setLoadingModelli] = useState(false);

  const [brandSearch, setBrandSearch] = useState("");
  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedModelUuid, setSelectedModelUuid] = useState("");
  const [savingModel, setSavingModel] = useState(false);

  useEffect(() => {
    if (!dataSearchSubmit) {
      setPraticaDemolizione([]);
      setSelected(null);
      setForm({});
      return;
    }

    let alive = true;

    (async () => {
      let query = supabase
        .from("dati_veicolo_ritirato")
        .select(
          `
          *,
          azienda:azienda_ritiro_veicoli(*),
          modello:modello_veicolo(marca,modello)
        `
        )
        .eq("pratica_completata", false)
        .or("demolizione_approvata.is.null,demolizione_approvata.eq.false")
        .eq("veicolo_ritirato", false)
        .eq("veicolo_consegnato", false)
        .order("created_at_veicolo_ritirato", { ascending: false });

      query = query.ilike("targa_veicolo_ritirato", `%${dataSearchSubmit}%`);

      const { data, error } = await query;

      if (!alive) return;

      if (error) {
        console.error(error);
        toast.error("Errore nel caricamento della pratica");
        setPraticaDemolizione([]);
        return;
      }

      setPraticaDemolizione(data ?? []);
    })();

    return () => {
      alive = false;
    };
  }, [dataSearchSubmit]);

  // === POPOLA FORM PRINCIPALE QUANDO SELEZIONI ===
  useEffect(() => {
    if (!selected) {
      setForm({});
      return;
    }
    setForm({ ...selected });
  }, [selected]);

  // === CARICA MODELLI QUANDO SELEZIONI UNA PRATICA ===
  useEffect(() => {
    if (!selected) {
      setModelli([]);
      setBrandSearch("");
      setSelectedMarca("");
      setSelectedModelUuid("");
      return;
    }

    const currentMarca = selected?.modello?.marca ?? "";
    setSelectedMarca(currentMarca);
    setSelectedModelUuid(selected.uuid_modello_veicolo ?? "");
    setBrandSearch("");

    let alive = true;

    (async () => {
      setLoadingModelli(true);

      const { data, error } = await supabase
        .from("modello_veicolo")
        .select("uuid_modello_veicolo, marca, modello")
        .order("marca", { ascending: true })
        .order("modello", { ascending: true });

      if (!alive) return;

      setLoadingModelli(false);

      if (error) {
        console.error(error);
        toast.error("Errore caricamento modelli veicolo");
        return;
      }

      setModelli(data ?? []);
    })();

    return () => {
      alive = false;
    };
  }, [selected]);

  // === HELPERS ===
  function submitSearch() {
    const value = dataSearch.trim().toUpperCase();
    setDataSearchSubmit(value);
    if (value) toast.info(`ricerca targa ${value}`);
  }

  function handleReset() {
    setDataSearch("");
    setDataSearchSubmit("");
    setPraticaDemolizione([]);
    setSelected(null);
    setForm({});
  }

  function isEmptyValue(v) {
    if (v === null || v === undefined) return true;
    if (typeof v === "string" && v.trim() === "") return true;
    return false;
  }

  function shouldHideField(name, value) {
    if (HIDDEN_FIELDS.has(name)) return true;
    if (HIDE_IF_EMPTY.has(name) && isEmptyValue(value)) return true;
    return false;
  }

  function isEditableField(name, value) {
    if (READONLY_FIELDS.has(name)) return false;
    if (typeof value === "object" && value !== null) return false;
    return true;
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function buildPayloadForUpdate() {
    const payload = {};

    for (const [name, value] of Object.entries(form)) {
      if (shouldHideField(name, value)) continue;
      if (!isEditableField(name, value)) continue;

      if (value === "") payload[name] = null;
      else payload[name] = value;
    }

    return payload;
  }

  // Mantengo la validazione vin (anche se ora è readonly, non fa danni)
  function validateBeforeSave() {
    const vinLegibile = !!form.vin_legibile;

    if (vinLegibile) {
      const vin = (form.vin_veicolo_ritirato ?? "").toString().trim();
      if (vin.length < 5) {
        toast.error(
          "Se 'VIN leggibile' è attivo, inserisci un VIN di almeno 5 caratteri."
        );
        return false;
      }
    }

    return true;
  }

  async function handleSave() {
    if (!selected?.uuid_veicolo_ritirato) {
      toast.error("Manca uuid_veicolo_ritirato nel record selezionato");
      return;
    }

    if (!validateBeforeSave()) return;

    const payload = buildPayloadForUpdate();

    if (Object.keys(payload).length === 0) {
      toast.info("Nessun campo modificabile da salvare");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("dati_veicolo_ritirato")
      .update(payload)
      .eq("uuid_veicolo_ritirato", selected.uuid_veicolo_ritirato)
      .select(
        `
        *,
        azienda:azienda_ritiro_veicoli(*),
        modello:modello_veicolo(marca,modello)
      `
      )
      .single();

    setSaving(false);

    if (error) {
      console.error(error);
      toast.error("Errore nel salvataggio (controlla RLS/permessi)");
      return;
    }

    toast.success("Pratica aggiornata con successo");

    setSelected(data);
    setPraticaDemolizione((prev) =>
      prev.map((row) =>
        row.uuid_veicolo_ritirato === data.uuid_veicolo_ritirato ? data : row
      )
    );
  }

  // === CAMBIO MODELLO: marca + modello ===
  const brands = useMemo(() => {
    const set = new Set();
    for (const m of modelli) {
      if (m?.marca) set.add(m.marca);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [modelli]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const modelliByMarca = useMemo(() => {
    if (!selectedMarca) return [];
    return modelli
      .filter((m) => m.marca === selectedMarca)
      .sort((a, b) => (a.modello ?? "").localeCompare(b.modello ?? ""));
  }, [modelli, selectedMarca]);

  useEffect(() => {
    if (!selectedMarca) {
      setSelectedModelUuid("");
      return;
    }
    const ok = modelliByMarca.some(
      (m) => m.uuid_modello_veicolo === selectedModelUuid
    );
    if (!ok) setSelectedModelUuid("");
  }, [selectedMarca, modelliByMarca, selectedModelUuid]);

  async function handleSaveModel() {
    if (!selected?.uuid_veicolo_ritirato) {
      toast.error("Seleziona prima una pratica");
      return;
    }

    if (!selectedMarca) {
      toast.error("Seleziona una marca");
      return;
    }

    if (!selectedModelUuid) {
      toast.error("Seleziona un modello");
      return;
    }

    if (selectedModelUuid === (selected.uuid_modello_veicolo ?? "")) {
      toast.info("Il modello selezionato è già quello attuale");
      return;
    }

    setSavingModel(true);

    const { data, error } = await supabase
      .from("dati_veicolo_ritirato")
      .update({ uuid_modello_veicolo: selectedModelUuid })
      .eq("uuid_veicolo_ritirato", selected.uuid_veicolo_ritirato)
      .select(
        `
        *,
        azienda:azienda_ritiro_veicoli(*),
        modello:modello_veicolo(marca,modello)
      `
      )
      .single();

    setSavingModel(false);

    if (error) {
      console.error(error);
      toast.error("Errore nel salvataggio del modello");
      return;
    }

    toast.success("Modello aggiornato con successo");

    setSelected(data);
    setForm((prev) => ({
      ...prev,
      uuid_modello_veicolo: data.uuid_modello_veicolo,
      modello: data.modello,
    }));

    setPraticaDemolizione((prev) =>
      prev.map((row) =>
        row.uuid_veicolo_ritirato === data.uuid_veicolo_ritirato ? data : row
      )
    );
  }

  // === UI HELPERS: CAMPI MANUALI ===

  function Field({ name, label, type = "text", showIfEmpty = true }) {
    const value = form?.[name];

    if (!showIfEmpty) {
      if (isEmptyValue(value)) return null;
    }

    // se per policy vuoi nascondere alcuni campi sempre:
    if (HIDDEN_FIELDS.has(name)) return null;

    const editable = !READONLY_FIELDS.has(name);

    if (type === "checkbox") {
      return (
        <label className="flex items-center gap-2 border rounded-md p-2">
          <input
            type="checkbox"
            checked={!!value}
            disabled={!editable}
            onChange={(e) => handleChange(name, e.target.checked)}
          />
          <span className="text-sm font-medium">{label ?? name}</span>
        </label>
      );
    }

    if (type === "number") {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-70">{label ?? name}</span>
          <Input
            type="number"
            value={value ?? ""}
            disabled={!editable}
            onChange={(e) => {
              const v = e.target.value;
              handleChange(name, v === "" ? "" : Number(v));
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs opacity-70">{label ?? name}</span>
        <Input
          value={value ?? ""}
          disabled={!editable}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      </div>
    );
  }

  function SelectField({ name, label, options, showIfEmpty = true }) {
    const value = form?.[name];

    if (!showIfEmpty) {
      if (isEmptyValue(value)) return null;
    }

    if (HIDDEN_FIELDS.has(name)) return null;

    const editable = !READONLY_FIELDS.has(name);

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs opacity-70">{label ?? name}</span>
        <select
          className="h-9 rounded-md border px-3 text-sm bg-background"
          value={value ?? ""}
          disabled={!editable}
          onChange={(e) => handleChange(name, e.target.value)}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

	if (!isAdmin) return

  return (
    <div className={`${onDisplay ? "" : "hidden"} w-full flex flex-col gap-3 px-4`}>
      <div>
        <h4 className="text-[0.6rem] font-bold border border-brand px-3 py-2 w-fit rounded-xl">
          MODIFICA PRATICA
        </h4>
      </div>

      {/* Ricerca */}
      <div className="flex w-full items-center gap-2">
        <Input
          placeholder="Cerca targa…"
          value={dataSearch}
          onChange={(e) => setDataSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitSearch()}
        />
        <Button type="button" onClick={submitSearch}>
          Cerca
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Lista risultati */}
      <ul className="flex flex-col gap-2">
        {praticaDemolizione.map((p) => (
          <li key={p.uuid_veicolo_ritirato}>
            <button
              type="button"
              onClick={() => setSelected(p)}
              className={`w-full text-left border rounded-md p-2 ${
                selected?.uuid_veicolo_ritirato === p.uuid_veicolo_ritirato
                  ? "border-brand"
                  : "border-neutral-300"
              }`}
            >
              <div className="text-sm font-semibold">TARGA: {p.targa_veicolo_ritirato}</div>
              <div className="text-xs opacity-70">
                {p.modello?.marca} {p.modello?.modello}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* FORM */}
      {selected ? (
        <div className="border rounded-md p-3 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">
              Modifica pratica: {selected.targa_veicolo_ritirato}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={saving || savingModel}
              >
                Chiudi
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving || savingModel}>
                {saving ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </div>

          {/* === FORM CAMBIO MODELLO (marca + modello) === */}
          <div className="border rounded-md p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Cambia modello veicolo</div>
              <Button
                type="button"
                onClick={handleSaveModel}
                disabled={savingModel || loadingModelli}
              >
                {savingModel ? "Salvataggio..." : "Salva modello"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-xs opacity-70">Cerca marca</span>
                <Input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Es. PEUGEOT..."
                  disabled={loadingModelli}
                />

                <span className="text-xs opacity-70">Marca</span>
                <select
                  className="h-9 rounded-md border px-3 text-sm bg-background"
                  value={selectedMarca}
                  disabled={loadingModelli}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                >
                  <option value="">—</option>
                  {filteredBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {loadingModelli ? (
                  <span className="text-xs opacity-60">Caricamento marche/modelli...</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs opacity-70">Modello</span>
                <select
                  className="h-9 rounded-md border px-3 text-sm bg-background"
                  value={selectedModelUuid}
                  disabled={!selectedMarca || loadingModelli}
                  onChange={(e) => setSelectedModelUuid(e.target.value)}
                >
                  <option value="">—</option>
                  {modelliByMarca.map((m) => (
                    <option key={m.uuid_modello_veicolo} value={m.uuid_modello_veicolo}>
                      {m.modello}
                    </option>
                  ))}
                </select>

                <div className="text-xs opacity-70">
                  Attuale: <b>{selected?.modello?.marca} {selected?.modello?.modello}</b>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FORM ORDINATO MANUALE ===== */}
          <div className="flex flex-col gap-6">

            {/* VEICOLO */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">VEICOLO</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field name="uuid_veicolo_ritirato" label="UUID pratica" />
                <Field name="targa_veicolo_ritirato" label="Targa" />

                <Field name="vin_legibile" label="VIN leggibile" type="checkbox" />
                <Field name="vin_veicolo_ritirato" label="VIN" />

                <Field name="anno_veicolo_ritirato" label="Anno" type="number" />
                <Field name="km_veicolo_ritirato" label="KM" type="number" />
                <Field name="cilindrata_veicolo_ritirato" label="Cilindrata" type="number" />

              </div>
            </div>

            {/* DOCUMENTO VEICOLO */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">DOCUMENTO VEICOLO</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SelectField
                  name="tipologia_documento_veicolo_ritirato"
                  label="Tipologia documento"
                  options={OPTIONS_TIPO_DOC_VEICOLO}
                />
              </div>
            </div>

            {/* DETENTORE */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">DETENTORE</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field name="tipologia_detentore" label="Tipologia detentore" />
                <Field name="forma_legale_detentore" label="Forma legale" />

                <Field name="nome_detentore" label="Nome" />
                <Field name="cognome_detentore" label="Cognome" />

                <Field name="ragione_sociale_detentore" label="Ragione sociale" showIfEmpty={false} />
                <Field name="piva_detentore" label="P.IVA" showIfEmpty={false} />
                <Field name="cf_detentore" label="Codice fiscale" showIfEmpty={false} />

                <Field name="email_detentore" label="Email" />
                <Field name="mobile_detentore" label="Telefono" />
              </div>
            </div>

            {/* INDIRIZZO */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">INDIRIZZO</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field name="indirizzo_detentore" label="Indirizzo" />
                <Field name="cap_detentore" label="CAP" />
                <Field name="citta_detentore" label="Città" />
                <Field name="provincia_detentore" label="Provincia" />
              </div>
            </div>

            {/* DOCUMENTO DETENTORE */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">DOCUMENTO DETENTORE</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SelectField
                  name="nazionalita_documento_detentore"
                  label="Nazionalità documento"
                  options={OPTIONS_NAZIONALITA_DOC}
                />
                <Field name="tipologia_documento_detentore" label="Tipo documento" />
                <Field name="numero_documento_detentore" label="Numero documento" />
              </div>
            </div>

            {/* STATO / GRAVAMI */}
            <div>
              <h5 className="text-xs font-bold opacity-70 mb-2">STATO</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SelectField
                  name="stato_gravami"
                  label="Stato gravami"
                  options={OPTIONS_STATO_GRAVAMI}
                />
                {/* aggiungi qui eventuali altri campi di stato che NON hai messo hidden */}
              </div>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}
