"use client";

import { useEffect, useState, useRef } from "react";
import comuni from "@/app/componenti/comuni.json";
import { supabase } from "@/lib/supabaseClient";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldDescription } from "@/components/ui/field";

import { toast } from "sonner";
import { FaPlusSquare } from "react-icons/fa";

import {
  Check,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  AiOutlineLoading3Quarters,
  AiOutlineCheck,
  AiOutlineClose,
} from "react-icons/ai";

import { useAdmin } from "@/app/admin/components/AdminContext";

export default function InserimentoVeicoliRitirati({
  onDisplay,
  statusAziende,
  setStatusAziende,
}) {

  /*
  |--------------------------------------------------------------------------
  | DATI UTENTE
  |--------------------------------------------------------------------------
  */

  const utente = useAdmin();

  const role = utente?.utente?.user_metadata?.ruolo;
  const uuidUtente = utente?.utente?.id;

  const isAdmin =
    role === "admin" ||
    role === "superadmin";

  const isCompany = role === "company";

  /*
  |--------------------------------------------------------------------------
  | STATE GENERALI
  |--------------------------------------------------------------------------
  */

  const [aziendeRitiro, setAziendeRitiro] = useState([]);
  const [ruoliUtente, setRuoliUtente] = useState([]);

  const [open, setOpen] = useState(false);
  const [openMarchio, setOpenMarchio] = useState(false);
  const [openModello, setOpenModello] = useState(false);

  const [statusSend, setStatusSend] = useState(false);

  const [aziendaScelta, setAziendaScelta] = useState("");

  const [modelliAuto, setModelliAuto] = useState([]);
  const [marchiAuto, setMarchiAuto] = useState([]);

  const [modelloSelect, setModelloSelect] = useState("");
  const [marchioSelect, setMarchioSelect] = useState("");

  const [gravamiSelect, setGravamiSelect] = useState(false);

  const [targaCaricare, setTargaCaricare] = useState(false);
  const [telaioCaricare, setTelaioCaricare] = useState(false);

  const [ritiroInserito, setRitiroInserito] = useState({});

  /*
  |--------------------------------------------------------------------------
  | STATE UPLOAD DOCUMENTI
  |--------------------------------------------------------------------------
  */

  const [uploadingByField, setUploadingByField] = useState({});

  const anyUploading =
    Object.values(uploadingByField).some(Boolean);

  const [resetUploadsTick, setResetUploadsTick] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | STATE FOTO VEICOLO
  |--------------------------------------------------------------------------
  |
  | Queste foto NON vengono caricate subito.
  |
  | Vengono mantenute temporaneamente come File
  | fino alla creazione del veicolo.
  |
  */

  const [fotoVeicolo, setFotoVeicolo] = useState({
    foto_anteriore: null,
    foto_posteriore: null,
    foto_laterale_sx: null,
    foto_laterale_dx: null,
    foto_aggiuntiva_uno: null,
    foto_aggiuntiva_due: null,
  });

  const [resetFotoTick, setResetFotoTick] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | STEP FORM
  |--------------------------------------------------------------------------
  */

  const [twoStep, setTwoStep] = useState(false);
  const [threeStep, setThreeStep] = useState(false);
  const [fourStep, setFourStep] = useState(false);
  const [fiveStep, setFiveStep] = useState(false);
  const [sixStep, setSixStep] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | INDIRIZZO
  |--------------------------------------------------------------------------
  */

  const [provinciaLegale, setProvinciaLegale] =
    useState("");

  const [cittaLegale, setCittaLegale] =
    useState([]);

  const [capLegale, setCapLegale] =
    useState([]);

  const [
    cittaSelezionataLegale,
    setCittaSelezionataLegale,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FORM DATA
  |--------------------------------------------------------------------------
  */

  const initialFormData = {
    uuid_modello: "",

    targa: "",

    vinLeggibile: true,
    vin: "",

    statoGravami: "",

    anno: "",
    cilindrata: "",
    km: "",

    tipologiaDetentore: "",
    formaLegale: "",

    ragioneSociale: "",
    nome: "",
    cognome: "",

    cf: "",
    piva: "",

    tipologiaDocumentoD: "",
    numeroDocumento: "",

    nazionalita: "",

    provincia: "",
    citta: "",
    cap: "",
    indirizzo: "",

    email: "",
    mobile: "",

    documentoVeicolo: "",

    fronteDOCveicolo: "",
    retroDOCveicolo: "",

    fronteDOCcomplementare: "",
    retroDOCcomplementare: "",

    fronteDOCdetentore: "",
    retroDOCdetentore: "",

    note_pratica: "",

    completato: false,
  };

  const [formData, setFormData] =
    useState(initialFormData);

  /*
  |--------------------------------------------------------------------------
  | PROVINCE
  |--------------------------------------------------------------------------
  */

  const province = comuni.flatMap(
    (c) => c.sigla
  );

  const provinceSet = [
    ...new Set(province),
  ].sort();

  /*
  |--------------------------------------------------------------------------
  | CARICAMENTO RUOLI
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    (async () => {

      const {
        data: ruoliData,
        error,
      } = await supabase
        .from("rules_user")
        .select("*")
        .order("alias_rules", {
          ascending: false,
        });

      if (error) {

        console.error(error);

        toast.error(
          "Errore nel caricamento ruoli"
        );

        return;
      }

      setRuoliUtente(
        ruoliData ?? []
      );

    })();

  }, []);

  /*
  |--------------------------------------------------------------------------
  | CARICAMENTO AZIENDE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!role) return;

    if (
      (!isAdmin || isCompany) &&
      !uuidUtente
    ) {
      return;
    }

    const fetchData = async () => {

      let query = supabase
        .from("azienda_ritiro_veicoli")
        .select("*")
        .eq("attiva_arv", true)
        .order(
          "ragione_sociale_arv",
          {
            ascending: false,
          }
        );

      if (isCompany) {

        query = query.eq(
          "uuid_azienda_ritiro_veicoli",
          uuidUtente
        );

      }

      const {
        data,
        error,
      } = await query;

      if (error) {

        console.error(error);

        toast.error(
          "Errore caricamento aziende"
        );

        return;
      }

      setAziendeRitiro(
        data ?? []
      );

    };

    fetchData();

  }, [
    role,
    uuidUtente,
    isAdmin,
    isCompany,
  ]);

  /*
  |--------------------------------------------------------------------------
  | OPTIONS AZIENDE
  |--------------------------------------------------------------------------
  */

  const optionsAziendeRitiro =
    aziendeRitiro.map((ar) => ({
      value:
        ar.uuid_azienda_ritiro_veicoli,

      label:
        ar.ragione_sociale_arv,
    }));

  /*
  |--------------------------------------------------------------------------
  | CARICAMENTO MARCHE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    (async () => {

      const {
        data: marchiAutoData,
        error,
      } = await supabase
        .from("vw_marche_uniche")
        .select("marca")
        .order("marca", {
          ascending: true,
        });

      if (error) {

        console.error(error);

        toast.error(
          "Errore nel caricamento Marchi Auto"
        );

        return;
      }

      setMarchiAuto(
        marchiAutoData ?? []
      );

    })();

  }, []);

  const optionsMarcaVeicolo =
    marchiAuto.map((m) => ({
      value: m.marca,
      label: m.marca,
    }));

  /*
  |--------------------------------------------------------------------------
  | CARICAMENTO MODELLI
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!marchioSelect) {

      setModelliAuto([]);

      return;
    }

    (async () => {

      const {
        data: modelliAutoData,
        error,
      } = await supabase
        .from("modello_veicolo")
        .select(
          "marca, modello, uuid_modello_veicolo"
        )
        .eq(
          "marca",
          marchioSelect
        );

      if (error) {

        console.error(error);

        toast.error(
          "Errore nel caricamento Modelli Marchio Auto"
        );

        return;
      }

      setModelliAuto(
        modelliAutoData ?? []
      );

    })();

  }, [marchioSelect]);

  const optionsModelliMarchio =
    [...modelliAuto]
      .sort((a, b) =>
        a.modello.localeCompare(
          b.modello,
          "it",
          {
            sensitivity: "base",
          }
        )
      )
      .map((m) => ({
        value:
          m.uuid_modello_veicolo,

        label:
          m.modello,
      }));

  /*
  |--------------------------------------------------------------------------
  | CONTROLLO TARGA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const raw =
      formData?.targa ?? "";

    const targa = raw
      .toUpperCase()
      .replace(/\s+/g, "");

    if (
      targa.length < 3 ||
      targa.length > 8
    ) {

      setTargaCaricare(false);

      return;
    }

    let cancelled = false;

    (async () => {

      const {
        count,
        error,
      } = await supabase
        .from(
          "dati_veicolo_ritirato"
        )
        .select(
          "targa_veicolo_ritirato",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "targa_veicolo_ritirato",
          targa
        );

      if (error) {

        console.error(error);

        toast.error(
          "Errore nel controllo targa"
        );

        return;
      }

      if (!cancelled) {

        setTargaCaricare(
          (count ?? 0) > 0
        );

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [formData.targa]);

  /*
  |--------------------------------------------------------------------------
  | CONTROLLO VIN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const raw =
      formData?.vin ?? "";

    const telaio = raw
      .toUpperCase()
      .replace(/\s+/g, "");

    if (
      telaio.length < 5
    ) {

      setTelaioCaricare(false);

      return;
    }

    let cancelled = false;

    (async () => {

      const {
        count,
        error,
      } = await supabase
        .from(
          "dati_veicolo_ritirato"
        )
        .select(
          "vin_veicolo_ritirato",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "vin_veicolo_ritirato",
          telaio
        );

      if (error) {

        console.error(error);

        toast.error(
          "Errore nel controllo telaio"
        );

        return;
      }

      if (!cancelled) {

        setTelaioCaricare(
          (count ?? 0) > 0
        );

      }

    })();

    return () => {

      cancelled = true;

    };

  }, [formData.vin]);

  /*
  |--------------------------------------------------------------------------
  | OPTIONS SELECT
  |--------------------------------------------------------------------------
  */

  const tipologiaDetentoreOption = [
    {
      label: "Proprietario",
      value: "proprietario",
    },

    {
      label:
        "Proprietario Non Intestatario",

      value:
        "proprietario non intestatario",
    },
  ];

  const formaLegaleOption = [
    {
      label: "Privato",
      value: "privato",
    },

    {
      label: "Azienda",
      value: "azienda",
    },
  ];

  const tipologiaDocumentoOption = [
    {
      label: "Patente di Guida",
      value: "patente",
    },

    {
      label: "Carta Identità",
      value: "cie",
    },

    {
      label: "Passaporto",
      value: "passaporto",
    },

    {
      label: "Altro",
      value: "altro",
    },
  ];

  const nazionalitaDetentoreOption = [
    {
      label: "Italiana",
      value: "it",
    },

    {
      label: "Europea",
      value: "eu",
    },

    {
      label: "Altro",
      value: "altro",
    },
  ];

  const tipologiaDocumentoVeicoloOption = [
    {
      label:
        "Carta di Circolazione",

      value:
        "carta di circolazione",
    },

    {
      label: "Denuncia",
      value: "denuncia",
    },
  ];

  const statoGravamiOption = [
    {
      label: "Buona Unico",
      value: "unico",
    },

    {
      label: "Buona Cartaceo",
      value: "cartaceo",
    },

    {
      label: "Buona Digitale",
      value: "digitale",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | CITTA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const cittaFiltrata =
      comuni
        .filter(
          (c) =>
            c.sigla ===
            provinciaLegale
        )
        .map((c) => c.nome)
        .sort((a, b) =>
          a.localeCompare(b)
        );

    setCittaLegale(
      cittaFiltrata
    );

  }, [provinciaLegale]);

  /*
  |--------------------------------------------------------------------------
  | CAP
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const capFiltrati =
      comuni
        .filter(
          (c) =>
            c.nome ===
            cittaSelezionataLegale
        )
        .flatMap(
          (c) => c.cap
        )
        .sort((a, b) =>
          a.localeCompare(b)
        );

    setCapLegale(
      capFiltrati
    );

  }, [
    cittaSelezionataLegale,
  ]);

  /*
  |--------------------------------------------------------------------------
  | GESTIONE STEP FORM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const annoCorrente =
      new Date().getFullYear();

    const fd =
      formData ?? {};

    const compilato = (value) => {

      if (
        typeof value === "string"
      ) {

        return (
          value.trim() !== ""
        );

      }

      return (
        value !== null &&
        value !== undefined
      );

    };

    /*
    |--------------------------------------------------------------------------
    | STEP 2
    |--------------------------------------------------------------------------
    */

    const twoOk =
      compilato(fd.targa) &&

      fd.targa.length >= 3 &&

      fd.targa.length <= 8 &&

      (
        (
          fd.vinLeggibile === true &&

          compilato(fd.vin) &&

          fd.vin.length >= 5 &&

          fd.vin.length <= 17
        )

        ||

        fd.vinLeggibile === false
      ) &&

      compilato(fd.anno) &&

      Number(fd.anno) > 1900 &&

      Number(fd.anno) <=
        annoCorrente;

    /*
    |--------------------------------------------------------------------------
    | IDENTIFICAZIONE
    |--------------------------------------------------------------------------
    */

    const idOk =
      fd.cf?.trim() !== ""

      ||

      (
        fd.ragioneSociale?.trim() !== "" &&

        fd.piva?.trim() !== ""
      );

    /*
    |--------------------------------------------------------------------------
    | STEP 3
    |--------------------------------------------------------------------------
    */

    const threeOk =
      compilato(
        fd.tipologiaDetentore
      ) &&

      compilato(
        fd.formaLegale
      ) &&

      idOk &&

      compilato(fd.nome) &&

      compilato(fd.cognome) &&

      compilato(
        fd.tipologiaDocumentoD
      ) &&

      compilato(
        fd.numeroDocumento
      ) &&

      compilato(
        fd.nazionalita
      ) &&

      compilato(fd.provincia) &&

      compilato(fd.citta) &&

      compilato(fd.cap) &&

      compilato(fd.indirizzo);

    /*
    |--------------------------------------------------------------------------
    | STEP 4
    |--------------------------------------------------------------------------
    */

    const fourOk =
      compilato(fd.email) &&
      compilato(fd.mobile);

    /*
    |--------------------------------------------------------------------------
    | STEP 5
    |--------------------------------------------------------------------------
    */

    const fiveOk =
      compilato(
        fd.documentoVeicolo
      );

    /*
    |--------------------------------------------------------------------------
    | STEP 6
    |--------------------------------------------------------------------------
    */

    const sixOk =
      compilato(
        fd.fronteDOCveicolo
      ) &&

      compilato(
        fd.retroDOCveicolo
      ) &&

      compilato(
        fd.fronteDOCdetentore
      ) &&

      compilato(
        fd.retroDOCdetentore
      );

    setTwoStep(twoOk);

    setThreeStep(threeOk);

    setFourStep(fourOk);

    setFiveStep(fiveOk);

    setSixStep(sixOk);

  }, [formData]);

  /*
  |--------------------------------------------------------------------------
  | STATUS UPDATE
  |--------------------------------------------------------------------------
  */

  async function StatusUpdate(
    uuidVeicolo,
    uuidStatoAvanzamento
  ) {

    const payloadStatus = {

      uuid_veicolo_ritirato:
        uuidVeicolo,

      uuid_stato_avanzamento:
        uuidStatoAvanzamento,
    };

    const {
      data,
      error,
    } = await supabase
      .from(
        "log_avanzamento_demolizione"
      )
      .insert(payloadStatus)
      .select()
      .single();

    if (error) {

      console.log(
        "Errore statusUpdate:",
        error
      );

    } else {

      console.log(
        "Stato aggiornato:",
        data
      );

    }

  }

  /*
  |--------------------------------------------------------------------------
  | HANDLERS
  |--------------------------------------------------------------------------
  */

  function handleChangeCheckbox(e) {

    const {
      name,
      checked,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,

        [name]: checked,

        vin: "",
      })
    );

  }

  function handleChangeProvinciaLegale(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,

        citta: "",
        cap: "",
      })
    );

    setProvinciaLegale(
      value
    );

    setCittaSelezionataLegale("");

    setCapLegale([]);

  }

  function handleChangeCittaLegale(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,

        cap: "",
      })
    );

    setCittaSelezionataLegale(
      value
    );

  }

  function handleChangeCapLegale(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  }

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  }

  function handleChangeTarga(e) {

    const {
      name,
      value,
    } = e.target;

    const nuovaTarga = value
      .toUpperCase()
      .replace(/\s+/g, "")
      .slice(0, 8);

    setFormData(
      (prev) => ({
        ...prev,

        [name]:
          nuovaTarga,
      })
    );

  }

  function handleChangeGravami(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,

        [name]: value,
      })
    );

    setGravamiSelect(true);

  }

  function handleChangePiva(e) {

    const {
      name,
      value,
    } = e.target;

    const digitsOnly =
      value
        .trim()
        .replace(/\D/g, "")
        .slice(0, 11);

    setFormData(
      (prev) => ({
        ...prev,

        [name]:
          digitsOnly,
      })
    );

  }

  function handleChangeRagioneSociale(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,

        [name]:
          value.toUpperCase(),
      })
    );

  }

  /*
  |--------------------------------------------------------------------------
  | DOCUMENTI UPLOAD HANDLER
  |--------------------------------------------------------------------------
  */

  function handleChangeUpload(e) {

    const {
      name,
      files,
    } = e.target || {};

    const first =
      Array.isArray(files)
        ? files[0]
        : undefined;

    if (!name) return;

    if (!first) {

      console.warn(
        `[handleChangeUpload] nessun file caricato per ${name}`
      );

      return;
    }

    setFormData(
      (prev) => ({
        ...prev,

        [name]:
          first.url || "",
      })
    );

  }

  function handleBusyChange(
    nomeCampo,
    isBusy
  ) {

    setUploadingByField(
      (prev) => ({
        ...prev,

        [nomeCampo]:
          isBusy,
      })
    );

  }

  /*
  |--------------------------------------------------------------------------
  | FOTO VEICOLO - SELEZIONE
  |--------------------------------------------------------------------------
  */

  function handleFotoVeicoloChange(e) {

    const {
      name,
      files,
    } = e.target;

    const file =
      files?.[0] || null;

    if (!file) {

      setFotoVeicolo(
        (prev) => ({
          ...prev,

          [name]: null,
        })
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | MAX 15MB
    |--------------------------------------------------------------------------
    */

    const maxSize =
      15 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {

      toast.error(
        "La foto supera il limite massimo di 15 MB"
      );

      e.target.value = "";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | CONTROLLO FORMATO
    |--------------------------------------------------------------------------
    */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      toast.error(
        "Selezionare un file immagine"
      );

      e.target.value = "";

      return;
    }

    setFotoVeicolo(
      (prev) => ({
        ...prev,

        [name]:
          file,
      })
    );

  }

  /*
  |--------------------------------------------------------------------------
  | RIMOZIONE FOTO VEICOLO
  |--------------------------------------------------------------------------
  */

  function removeFotoVeicolo(
    nome
  ) {

    setFotoVeicolo(
      (prev) => ({
        ...prev,

        [nome]: null,
      })
    );

    /*
    |--------------------------------------------------------------------------
    | Rimonta gli input file
    |--------------------------------------------------------------------------
    */

    setResetFotoTick(
      (prev) =>
        prev + 1
    );

  }

  /*
  |--------------------------------------------------------------------------
  | UPLOAD FOTO VEICOLO
  |--------------------------------------------------------------------------
  |
  | Viene chiamata SOLO dopo aver ottenuto
  | uuid_veicolo_ritirato.
  |
  */

  async function uploadFotoVeicolo( uuidVeicolo, targa ) {

    const bucket = "fotoveicoli";

    const safeTarga = String(targa || "no-targa")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9]/g, "");
      
    const fotoCaricate = {
      foto_anteriore: null,
      foto_posteriore: null,
      foto_laterale_sx: null,
      foto_laterale_dx: null,
      foto_aggiuntiva_uno: null,
      foto_aggiuntiva_due: null,
    };

    const errori = [];

    for (const [ campo, file ] of Object.entries(fotoVeicolo)) {

      if (!file) continue;

      const estensione = file.name?.split(".").pop()?.toLowerCase() || "jpg";
      
      const path =
        `${uuidVeicolo}/${safeTarga}-${campo}.${estensione}`;

      const { error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload( 
        path, file,
          {
            cacheControl:
              "3600",

            upsert:
              true,

            contentType:
              file.type ||
              "application/octet-stream",
          }
        );

      if (uploadError) {

        console.error(
          `Errore upload ${campo}:`,
          uploadError
        );

        errori.push({
          campo,
          error:
            uploadError,
        });

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | URL PUBBLICO
      |--------------------------------------------------------------------------
      */

      const { data: publicData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(
          path
        );

      fotoCaricate[ campo ] = publicData?.publicUrl || null }

    return {
      fotoCaricate,
      errori,
    };

  }

  /*
  |--------------------------------------------------------------------------
  | INSERIMENTO FOTO NEL DATABASE
  |--------------------------------------------------------------------------
  */

  async function salvaFotoVeicolo( uuidVeicolo ) {

    const fotoSelezionate = Object.values( fotoVeicolo ).some(Boolean);

    if ( !fotoSelezionate ) {

      return {
        success: true,
        uploaded: 0,
        errors: [],
      };

    }

    const { fotoCaricate, errori } = await uploadFotoVeicolo( uuidVeicolo, formData.targa );
    const numeroFotoCaricate =  Object.values( fotoCaricate ).filter(Boolean).length;

    if ( numeroFotoCaricate === 0 ) {

      return {
        success: false,

        uploaded: 0,

        errors:
          errori,
      };

    }

    const payloadFoto = {
      uuid_veicolo_ritirato: uuidVeicolo,
      foto_anteriore: fotoCaricate.foto_anteriore,
      foto_posteriore: fotoCaricate.foto_posteriore,
      foto_laterale_sx: fotoCaricate.foto_laterale_sx,
      foto_laterale_dx: fotoCaricate.foto_laterale_dx,
      foto_aggiuntiva_uno: fotoCaricate.foto_aggiuntiva_uno,
      foto_aggiuntiva_due: fotoCaricate.foto_aggiuntiva_due,
    };

    const { error: fotoDbError } = await supabase
      .from("veicolo_ritirato_foto")
      .insert(payloadFoto);

    if ( fotoDbError ) {

      console.error("Errore inserimento veicolo_ritirato_foto:", fotoDbError);

      return { 
        success: false,
        uploaded: numeroFotoCaricate,

        errors: [
          ...errori,

          {
            campo:
              "database",

            error:
              fotoDbError,
          },
        ],
      };

    }

    return {
      success:
        errori.length === 0,

      uploaded:
        numeroFotoCaricate,

      errors:
        errori,
    };

  }

  async function handleSubmit(e) {

    e.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | EVITO DOPPIO CLICK
    |--------------------------------------------------------------------------
    */

    if (
      statusSend
    ) {

      return;

    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAZIONI
    |--------------------------------------------------------------------------
    */

    if (
      aziendaScelta === ""
    ) {

      alert(
        "Selezionare Azienda"
      );

      return;
    }

    if (
      modelloSelect === ""
    ) {

      alert(
        "Selezionare Veicolo"
      );

      return;
    }

    if (
      formData.statoGravami === ""
    ) {

      alert(
        "Selezionare Stato GRAVAMI"
      );

      return;
    }

    if (
      targaCaricare === true
    ) {

      alert(
        "Targa già inserita"
      );

      return;
    }

    if (
      telaioCaricare === true
    ) {

      alert(
        "Telaio già inserito"
      );

      return;
    }

    if (
      formData.vinLeggibile === true &&
      formData.vin === ""
    ) {

      alert(
        "Compilare VIN"
      );

      return;
    }

    if (
      anyUploading
    ) {

      toast.error(
        "Attendere il completamento del caricamento documenti"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | INIZIO SALVATAGGIO
    |--------------------------------------------------------------------------
    */

    setStatusSend(true);

    const payload = {

      uuid_azienda_ritiro_veicoli:
        aziendaScelta ||
        null,

      uuid_modello_veicolo:
        modelloSelect ||
        null,

      anno_veicolo_ritirato:
        formData.anno ||
        null,

      cilindrata_veicolo_ritirato:
        formData.cilindrata ||
        null,

      vin_leggibile:
        formData.vinLeggibile,

      vin_veicolo_ritirato:
        formData.vin
          ?.toUpperCase()
          .trim()

        ||

        null,

      stato_gravami:
        formData.statoGravami,

      targa_veicolo_ritirato:
        formData.targa
          ?.toUpperCase()
          .trim()

        ||

        null,

      km_veicolo_ritirato:
        formData.km ||
        null,

      tipologia_detentore:
        formData
          .tipologiaDetentore

        ||

        null,

      forma_legale_detentore:
        formData
          .formaLegale

        ||

        null,

      ragione_sociale_detentore:
        formData
          .ragioneSociale
          ?.toUpperCase()

        ||

        null,

      nome_detentore:
        formData.nome
          ?.toUpperCase()

        ||

        null,

      cognome_detentore:
        formData
          .cognome
          ?.toUpperCase()

        ||

        null,

      cf_detentore:
        formData.cf
          ?.toUpperCase()

        ||

        null,

      piva_detentore:
        formData.piva
          ?.toUpperCase()

        ||

        null,

      tipologia_documento_detentore:
        formData
          .tipologiaDocumentoD

        ||

        null,

      numero_documento_detentore:
        formData
          .numeroDocumento
          ?.toUpperCase()

        ||

        null,

      nazionalita_documento_detentore:
        formData
          .nazionalita

        ||

        null,

      email_detentore:
        formData.email
          ?.toLowerCase()

        ||

        null,

      mobile_detentore:
        formData.mobile ||
        null,

      cap_detentore:
        formData.cap ||
        null,

      provincia_detentore:
        formData.provincia ||
        null,

      indirizzo_detentore:
        formData.indirizzo ||
        null,

      citta_detentore:
        formData.citta ||
        null,

      tipologia_documento_veicolo_ritirato:
        formData
          .documentoVeicolo

        ||

        null,

      foto_documento_veicolo_ritirato_f:
        formData
          .fronteDOCveicolo

        ||

        null,

      foto_documento_veicolo_ritirato_r:
        formData
          .retroDOCveicolo

        ||

        null,

      foto_complementare_veicolo_ritirato_f:
        formData
          .fronteDOCcomplementare

        ||

        null,

      foto_complementare_veicolo_ritirato_r:
        formData
          .retroDOCcomplementare

        ||

        null,

      foto_documento_detentore_f:
        formData
          .fronteDOCdetentore

        ||

        null,

      foto_documento_detentore_r:
        formData
          .retroDOCdetentore

        ||

        null,

      note:
        formData
          .note_pratica
          ?.trim()

        ||

        null,

      pratica_completata:
        formData.completato,

    };

    try {

      /*
      |--------------------------------------------------------------------------
      | 1. CREAZIONE VEICOLO
      |--------------------------------------------------------------------------
      */

      const {
        data,
        error,
      } = await supabase
        .from(
          "dati_veicolo_ritirato"
        )
        .insert(
          payload
        )
        .select()
        .single();

      if (
        error
      ) {

        console.error(
          error
        );

        toast.error(
          `Errore salvataggio: ${error.message}`
        );

        return;

      }

      const uuidVeicolo =
        data
          .uuid_veicolo_ritirato;

      const risultatoFoto =
        await salvaFotoVeicolo(
          uuidVeicolo
        );


        await StatusUpdate(
        uuidVeicolo,
        "3a936e04-5e62-488a-8310-6fa81998fb5b"
      );

      /*
      |--------------------------------------------------------------------------
      | EVENTUALE WARNING FOTO
      |--------------------------------------------------------------------------
      */

      if (
        risultatoFoto
          .errors
          .length > 0
      ) {

        toast.warning(
          `Pratica inserita. ${risultatoFoto.uploaded} foto caricate, ma alcune foto hanno generato un errore.`
        );

      } else {

        toast.success(
          "Pratica inserita con successo!"
        );

      }

      /*
      |--------------------------------------------------------------------------
      | SALVO ULTIMO RITIRO INSERITO
      |--------------------------------------------------------------------------
      */

      setRitiroInserito(
        data
      );

      /*
      |--------------------------------------------------------------------------
      | RESET FORM
      |--------------------------------------------------------------------------
      */

      setFormData({
        ...initialFormData,

        vinLeggibile:
          true,
      });

      /*
      |--------------------------------------------------------------------------
      | RESET FOTO VEICOLO
      |--------------------------------------------------------------------------
      */

      setFotoVeicolo({

        foto_anteriore:
          null,

        foto_posteriore:
          null,

        foto_laterale_sx:
          null,

        foto_laterale_dx:
          null,

        foto_aggiuntiva_uno:
          null,

        foto_aggiuntiva_due:
          null,

      });

      setResetFotoTick(
        (prev) =>
          prev + 1
      );

      /*
      |--------------------------------------------------------------------------
      | RESET DOCUMENTI
      |--------------------------------------------------------------------------
      */

      setResetUploadsTick(
        (prev) =>
          prev + 1
      );

      setUploadingByField({});

      /*
      |--------------------------------------------------------------------------
      | RESET SELECT
      |--------------------------------------------------------------------------
      */

      setModelloSelect("");

      setMarchioSelect("");

      setAziendaScelta("");

      setGravamiSelect(false);

      setProvinciaLegale("");

      setCittaSelezionataLegale("");

      setCittaLegale([]);

      setCapLegale([]);

      setTwoStep(false);

      setThreeStep(false);

      setFourStep(false);

      setFiveStep(false);

      setSixStep(false);

      /*
      |--------------------------------------------------------------------------
      | REFRESH LISTA
      |--------------------------------------------------------------------------
      */

      setStatusAziende(
        (prev) =>
          !prev
      );

    } catch (
      error
    ) {

      console.error(
        "Errore generale submit:",
        error
      );

      toast.error(
        "Si è verificato un errore durante il salvataggio"
      );

    } finally {

      setStatusSend(false);

    }

  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div
        className={`
          ${
            onDisplay
              ? ""
              : "hidden"
          }
          w-full
          flex-1
          min-h-0
          flex
          flex-col
          md:p-0
          md:pe-3
          px-4
        `}
      >

        <form
          onSubmit={
            handleSubmit
          }
          className="
            flex
            flex-col
            min-h-0
            gap-3
          "
        >

          {/* ===============================================================
              STEP 1
          =============================================================== */}

          <div
            id="oneStep"
            className="
              flex
              flex-col
              h-fit
              gap-3
            "
          >

            <div
              className="
                flex
                flex-row
                justify-between
              "
            >

              <div
                className="
                  flex
                  flex-row
                  gap-3
                "
              >

                <h4
                  className="
                    text-[0.6rem]
                    font-bold
                    text-dark
                    dark:text-brand
                    border
                    border-brand
                    px-3
                    py-2
                    w-fit
                    rounded-xl
                  "
                >
                  AZIENDA RITIRO VEICOLO
                </h4>

                <a
                  href="https://iservizi.aci.it/verificatipocdp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-[0.6rem]
                    font-bold
                    text-neutral-900
                    border
                    bg-brand
                    px-3
                    py-2
                    w-fit
                    rounded-xl
                  "
                >
                  VISURA GRAVAMI
                </a>

              </div>

              <button
                type="submit"

                disabled={
                  anyUploading ||
                  statusSend
                }

                className={`
                  ${
                    sixStep
                      ? ""
                      : "hidden"
                  }

                  bg-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                  h-full
                  disabled:opacity-50
                `}
              >

                {
                  statusSend
                    ? (
                      <AiOutlineLoading3Quarters
                        className="
                          animate-spin
                          text-white
                        "
                      />
                    )
                    : (
                      <FaPlusSquare
                        className="
                          font-bold
                          text-white
                        "
                      />
                    )
                }

              </button>

            </div>

            <div
              className="
                flex
                lg:flex-row
                flex-col
                gap-3
                p-6
                rounded-2xl
                min-w-0
                h-full
                bg-brand/50
              "
            >

              {/* AZIENDA */}

              <div
                className="
                  lg:basis-3/12
                  basis-full
                  min-w-0
                "
              >

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-1
                  "
                >
                  Azienda Ritiro
                </label>

                <Popover
                  open={open}
                  onOpenChange={
                    setOpen
                  }
                >

                  <PopoverTrigger
                    asChild
                  >

                    <Button
                      variant="outline"
                      role="combobox"

                      aria-expanded={
                        open
                      }

                      className="
                        w-full
                        min-w-0
                        justify-between
                        truncate
                      "
                    >

                      {
                        aziendaScelta

                          ? optionsAziendeRitiro
                              .find(
                                (ar) =>
                                  ar.value ===
                                  aziendaScelta
                              )
                              ?.label

                          : "seleziona un azienda..."
                      }

                      <ChevronsUpDown
                        className="
                          opacity-50
                        "
                      />

                    </Button>

                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={4}
                    className="p-0 w-[var(--radix-popover-trigger-width)]"
                  >

                    <Command
                      className="p-1"
                    >

                      <CommandInput
                        placeholder="Cerca..."
                        className="
                          h-8
                          my-2
                        "
                      />

                      <CommandList
                        className="my-1"
                      >

                        <CommandEmpty>
                          Nessun risultato
                        </CommandEmpty>

                        <CommandGroup>

                          {
                            optionsAziendeRitiro
                              .map(
                                (opt) => (

                                  <CommandItem
                                    key={
                                      opt.value
                                    }

                                    value={
                                      opt.label
                                    }

                                    onSelect={() => {

                                      setAziendaScelta(
                                        opt.value
                                      );

                                      setOpen(
                                        false
                                      );

                                    }}
                                  >

                                    {
                                      opt.label
                                    }

                                    <Check
                                      className={cn(
                                        "ml-auto",

                                        aziendaScelta ===
                                          opt.value

                                          ? "opacity-100"

                                          : "opacity-0"
                                      )}
                                    />

                                  </CommandItem>

                                )
                              )
                          }

                        </CommandGroup>

                      </CommandList>

                    </Command>

                  </PopoverContent>

                </Popover>

              </div>

              {/* MARCHIO */}

              <div
                className={`
                  ${
                    aziendaScelta
                      ? ""
                      : "hidden"
                  }

                  lg:basis-3/12
                  basis-full
                  min-w-0
                `}
              >

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-1
                  "
                >
                  Marchio Veicolo
                </label>

                <Popover
                  open={
                    openMarchio
                  }

                  onOpenChange={
                    setOpenMarchio
                  }
                >

                  <PopoverTrigger
                    asChild
                  >

                    <Button
                      variant="outline"
                      role="combobox"

                      aria-expanded={
                        openMarchio
                      }

                      className="
                        w-full
                        min-w-0
                        justify-between
                      "
                    >

                      {
                        marchioSelect

                          ? optionsMarcaVeicolo
                              .find(
                                (ar) =>
                                  ar.value ===
                                  marchioSelect
                              )
                              ?.label

                          : "seleziona un marchio..."
                      }

                      <ChevronsUpDown
                        className="
                          opacity-50
                        "
                      />

                    </Button>

                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={4}
                    className="
                      p-0
                      w-[var(--radix-popover-trigger-width)]
                    "
                  >

                    <Command
                      className="p-1"
                    >

                      <CommandInput
                        placeholder="Cerca..."
                        className="
                          h-8
                          my-2
                        "
                      />

                      <CommandList>

                        <CommandEmpty>
                          Nessun risultato
                        </CommandEmpty>

                        <CommandGroup>

                          {
                            optionsMarcaVeicolo
                              .map(
                                (opt) => (

                                  <CommandItem
                                    key={
                                      opt.value
                                    }

                                    value={
                                      opt.label
                                    }

                                    onSelect={() => {

                                      setMarchioSelect(
                                        opt.value
                                      );

                                      setModelloSelect(
                                        ""
                                      );

                                      setOpenMarchio(
                                        false
                                      );

                                    }}
                                  >

                                    {
                                      opt.label
                                    }

                                    <Check
                                      className={cn(
                                        "ml-auto",

                                        marchioSelect ===
                                          opt.value

                                          ? "opacity-100"

                                          : "opacity-0"
                                      )}
                                    />

                                  </CommandItem>

                                )
                              )
                          }

                        </CommandGroup>

                      </CommandList>

                    </Command>

                  </PopoverContent>

                </Popover>

              </div>

              {/* MODELLO */}

              <div
                className={`
                  ${
                    marchioSelect
                      ? ""
                      : "hidden"
                  }

                  lg:basis-3/12
                  basis-full
                  min-w-0
                `}
              >

                <label
                  className="
                    block
                    text-sm
                    font-semibold
                    mb-1
                  "
                >
                  Modello Veicolo
                </label>

                <Popover
                  open={
                    openModello
                  }

                  onOpenChange={
                    setOpenModello
                  }
                >

                  <PopoverTrigger
                    asChild
                  >

                    <Button
                      variant="outline"
                      role="combobox"

                      aria-expanded={
                        openModello
                      }

                      className="
                        w-full
                        min-w-0
                        justify-between
                      "
                    >

                      {
                        modelloSelect

                          ? optionsModelliMarchio
                              .find(
                                (ar) =>
                                  ar.value ===
                                  modelloSelect
                              )
                              ?.label

                          : "seleziona un modello..."
                      }

                      <ChevronsUpDown
                        className="
                          opacity-50
                        "
                      />

                    </Button>

                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={4}
                    className="
                      p-0
                      w-[var(--radix-popover-trigger-width)]
                    "
                  >

                    <Command
                      className="p-1"
                    >

                      <CommandInput
                        placeholder="Cerca..."
                        className="
                          h-8
                          my-2
                        "
                      />

                      <CommandList>

                        <CommandEmpty>
                          Nessun risultato
                        </CommandEmpty>

                        <CommandGroup>

                          {
                            optionsModelliMarchio
                              .map(
                                (opt) => (

                                  <CommandItem
                                    key={
                                      opt.value
                                    }

                                    value={
                                      opt.label
                                    }

                                    onSelect={() => {

                                      setModelloSelect(
                                        opt.value
                                      );

                                      setOpenModello(
                                        false
                                      );

                                    }}
                                  >

                                    {
                                      opt.label
                                    }

                                    <Check
                                      className={cn(
                                        "ml-auto",

                                        modelloSelect ===
                                          opt.value

                                          ? "opacity-100"

                                          : "opacity-0"
                                      )}
                                    />

                                  </CommandItem>

                                )
                              )
                          }

                        </CommandGroup>

                      </CommandList>

                    </Command>

                  </PopoverContent>

                </Popover>

              </div>

              {/* GRAVAMI */}

              <div
                className={`
                  ${
                    modelloSelect
                      ? ""
                      : "hidden"
                  }

                  lg:basis-3/12
                  basis-full
                  min-w-0
                `}
              >

                <FormSelectRuoli
                  nome="statoGravami"
                  label="Gravami ACI"
                  value={
                    formData
                      .statoGravami
                  }
                  basis="
                    basis-full
                  "
                  onchange={
                    handleChangeGravami
                  }
                  options={
                    statoGravamiOption
                  }
                />

              </div>

            </div>

          </div>

          {/* ===============================================================
              STEP 2 - VEICOLO
          =============================================================== */}

          <div
            id="twoStep"

            className={`
              ${
                gravamiSelect
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              gap-3
              h-fit
              w-full
            `}
          >

            <div
              className="w-full"
            >

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                NOTE PRATICA
              </h4>

            </div>

            <Textarea
              id="note_pratica"
              name="note_pratica"
              placeholder="Qui puoi scrivere le note..."
              className="
                resize-none
                rounded-2xl
                bg-white
                dark:bg-neutral-900
                focus:border-brand
              "
              value={
                formData
                  .note_pratica
              }
              onChange={
                handleChange
              }
              maxLength={300}
              rows={3}
            />

            <FieldDescription
              className="
                text-right
              "
            >
              {
                formData
                  .note_pratica
                  .length
              }
              /300 caratteri
            </FieldDescription>

            <div
              className="w-full"
            >

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                SPECIFICHE VEICOLO
              </h4>

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                p-6
                rounded-2xl
                min-w-0
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              <FormField
                nome="targa"
                label="Targa"
                value={
                  formData.targa
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChangeTarga
                }
                type="text"
              />

              <FormField
                nome="anno"
                label="Anno"
                value={
                  formData.anno
                }
                basis="
                  lg:basis-2/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

              <FormField
                nome="cilindrata"
                label="Cilindrata"
                value={
                  formData
                    .cilindrata
                }
                basis="
                  lg:basis-2/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="number"
              />

              <FormField
                nome="km"
                label="KM"
                value={
                  formData.km
                }
                basis="
                  lg:basis-2/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

              <hr
                className="w-full"
              />

              <FormCheckBox
                nome="vinLeggibile"
                label="VIN Leggibile"
                value={
                  formData
                    .vinLeggibile
                }
                basis="
                  lg:basis-2/12
                  basis-4/12
                "
                onchange={
                  handleChangeCheckbox
                }
              />

              <FormField
                nome="vin"
                label="VIN"
                value={
                  formData.vin
                }
                basis="
                  lg:basis-9/12
                  basis-7/12
                "
                onchange={
                  handleChange
                }
                type="text"
                status={
                  formData
                    .vinLeggibile

                    ? ""

                    : "hidden"
                }
              />

            </div>

          </div>

          {/* ===============================================================
              STEP 3 - DETENTORE
          =============================================================== */}

          <div
            id="threeStep"

            className={`
              ${
                twoStep
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              gap-3
              h-fit
              w-full
            `}
          >

            <div
              className="w-full"
            >

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                DETENTORE
              </h4>

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                p-6
                rounded-2xl
                min-w-0
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              <FormSelectRuoli
                nome="tipologiaDetentore"
                label="Tipologia Soggetto"
                value={
                  formData
                    .tipologiaDetentore
                }
                basis="
                  lg:basis-5/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                options={
                  tipologiaDetentoreOption
                }
              />

              <FormSelectRuoli
                nome="formaLegale"
                label="Forma Legale"
                value={
                  formData
                    .formaLegale
                }
                basis="
                  lg:basis-5/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                options={
                  formaLegaleOption
                }
              />

              <hr
                className="w-full"
              />

              <FormField
                nome="ragioneSociale"
                label="Ragione Sociale"
                value={
                  formData
                    .ragioneSociale
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChangeRagioneSociale
                }
                type="text"
                status={
                  formData
                    .formaLegale ===
                  "azienda"

                    ? ""

                    : "hidden"
                }
              />

              <FormField
                nome="piva"
                label="Partita IVA"
                value={
                  formData.piva
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChangePiva
                }
                type="text"
                status={
                  formData
                    .formaLegale ===
                  "azienda"

                    ? ""

                    : "hidden"
                }
              />

              <FormField
                nome="cf"
                label="Codice Fiscale"
                value={
                  formData.cf
                }
                basis="
                  lg:basis-6/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
                status={
                  formData
                    .formaLegale ===
                  "privato"

                    ? ""

                    : "hidden"
                }
              />

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                p-6
                rounded-2xl
                min-w-0
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              <FormField
                nome="nome"
                label="Nome"
                value={
                  formData.nome
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

              <FormField
                nome="cognome"
                label="Cognome"
                value={
                  formData.cognome
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

              <hr
                className="w-full"
              />

              <FormSelectRuoli
                nome="tipologiaDocumentoD"
                label="Tipologia Documento"
                value={
                  formData
                    .tipologiaDocumentoD
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                options={
                  tipologiaDocumentoOption
                }
              />

              <FormField
                nome="numeroDocumento"
                label="Numero Documento"
                value={
                  formData
                    .numeroDocumento
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

              <FormSelectRuoli
                nome="nazionalita"
                label="Nazionalità"
                value={
                  formData
                    .nazionalita
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                options={
                  nazionalitaDetentoreOption
                }
              />

              <hr
                className="w-full"
              />

              <FormSelect
                nome="provincia"
                label="Provincia"
                value={
                  formData.provincia
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChangeProvinciaLegale
                }
                options={
                  provinceSet
                }
              />

              <FormSelect
                nome="citta"
                label="Città"
                value={
                  formData.citta
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChangeCittaLegale
                }
                options={
                  cittaLegale
                }
              />

              <FormSelect
                nome="cap"
                label="Cap"
                value={
                  formData.cap
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChangeCapLegale
                }
                options={
                  capLegale
                }
              />

              <FormField
                nome="indirizzo"
                label="Indirizzo"
                value={
                  formData.indirizzo
                }
                basis="
                  lg:basis-6/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="text"
              />

            </div>

          </div>

          {/* ===============================================================
              STEP 4 - CONTATTI
          =============================================================== */}

          <div
            id="fourStep"

            className={`
              ${
                threeStep
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              gap-3
              h-fit
              w-full
            `}
          >

            <div>

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                CONTATTI
              </h4>

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                p-6
                rounded-2xl
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              <FormField
                nome="email"
                label="Email"
                value={
                  formData.email
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="email"
              />

              <FormField
                nome="mobile"
                label="Mobile"
                value={
                  formData.mobile
                }
                basis="
                  lg:basis-4/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                type="tel"
              />

            </div>

          </div>

          {/* ===============================================================
              STEP 5 - DOCUMENTI
          =============================================================== */}

          <div
            id="fiveStep"

            className={`
              ${
                fourStep
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              gap-3
              h-fit
              w-full
            `}
          >

            <div>

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                DOCUMENTI
              </h4>

            </div>

            <div
              className="
                flex
                flex-wrap
                gap-3
                p-6
                rounded-2xl
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              <FormSelectRuoli
                nome="documentoVeicolo"
                label="Documento Veicolo"
                value={
                  formData
                    .documentoVeicolo
                }
                basis="
                  lg:basis-3/12
                  basis-full
                "
                onchange={
                  handleChange
                }
                options={
                  tipologiaDocumentoVeicoloOption
                }
              />

            </div>

          </div>

          {/* ===============================================================
              STEP 6 - DOCUMENTI + FOTO VEICOLO
          =============================================================== */}

          <div
            id="sixStep"

            className={`
              ${
                fiveStep
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              gap-3
              h-fit
              w-full
            `}
          >

            <div>

              <h4
                className="
                  text-[0.6rem]
                  font-bold
                  text-dark
                  dark:text-brand
                  border
                  border-brand
                  px-3
                  py-2
                  w-fit
                  rounded-xl
                "
              >
                FOTO DOCUMENTI
              </h4>

            </div>

            <div
              className="
                flex
                flex-wrap
                p-6
                rounded-2xl
                min-w-0
                bg-white
                dark:bg-neutral-900
                border
              "
            >

              {/* LIBRETTO */}

              <div
                className="
                  flex
                  flex-col
                  basis-full
                  gap-1
                  p-1
                "
              >

                <div
                  className="
                    flex
                    lg:flex-row
                    flex-col
                    gap-3
                  "
                >

                  <FormFileUpload
                    nome="fronteDOCveicolo"
                    label="Documento Veicolo - Fronte"
                    bucket="documentiveicoli"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="DOCVEICFronte"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                  <FormFileUpload
                    nome="retroDOCveicolo"
                    label="Documento Veicolo - Retro"
                    bucket="documentiveicoli"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="DOCVEICRetro"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                </div>

                <hr
                  className="
                    w-full
                    border-brand
                    my-3
                  "
                />

              </div>

              {/* COMPLEMENTARE */}

              <div
                className={`
                  ${
                    formData.statoGravami !==
                    "cartaceo"

                      ? "hidden"

                      : ""
                  }

                  flex
                  flex-col
                  basis-full
                  gap-1
                  p-1
                `}
              >

                <div
                  className="
                    flex
                    lg:flex-row
                    flex-col
                    gap-3
                  "
                >

                  <FormFileUpload
                    nome="fronteDOCcomplementare"
                    label="Documento Complementare - Fronte"
                    bucket="documentiveicoli"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="ComplementareFronte"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                  <FormFileUpload
                    nome="retroDOCcomplementare"
                    label="Documento Complementare - Retro"
                    bucket="documentiveicoli"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="ComplementareRetro"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                </div>

                <hr
                  className="
                    w-full
                    border-brand
                    my-3
                  "
                />

              </div>

              {/* DOCUMENTI DETENTORE */}

              <div
                className="
                  flex
                  flex-col
                  basis-full
                  gap-1
                  p-1
                "
              >

                <div
                  className="
                    flex
                    lg:flex-row
                    flex-col
                    gap-3
                  "
                >

                  <FormFileUpload
                    nome="fronteDOCdetentore"
                    label="Documento Detentore - Fronte"
                    bucket="documentidetentori"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="DOCDETENTFronte"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                  <FormFileUpload
                    nome="retroDOCdetentore"
                    label="Documento Detentore - Retro"
                    bucket="documentidetentori"
                    accept=".pdf,.jpg,.jpeg,.png"
                    campo="DOCDETENTRetro"
                    basis="
                      xl:basis-6/12
                      basis-full
                    "
                    targa={
                      formData.targa
                    }
                    makePublic={true}
                    onchange={
                      handleChangeUpload
                    }
                    onBusyChange={
                      handleBusyChange
                    }
                    resetToken={
                      resetUploadsTick
                    }
                    pathPrefix={
                      `public/${aziendaScelta}/${formData.targa}`
                    }
                  />

                </div>

              </div>

            </div>

            {/* =============================================================
                FOTO VEICOLO
            ============================================================= */}

            <div className="w-full mt-3">
              <h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl"> FOTO VEICOLO </h4>
            </div>

            <div key={ resetFotoTick } className="grid xl:grid-cols-2 grid-cols-1 gap-4 p-6 rounded-2xl bg-white dark:bg-neutral-900 border">

              <FormFotoVeicolo nome="foto_anteriore" label="Foto Anteriore" file={fotoVeicolo.foto_anteriore}
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_anteriore"
                  )
                }
              />

              <FormFotoVeicolo
                nome="foto_posteriore"
                label="Foto Posteriore"
                file={
                  fotoVeicolo
                    .foto_posteriore
                }
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_posteriore"
                  )
                }
              />

              <FormFotoVeicolo
                nome="foto_laterale_sx"
                label="Foto Laterale Sinistra"
                file={
                  fotoVeicolo
                    .foto_laterale_sx
                }
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_laterale_sx"
                  )
                }
              />

              <FormFotoVeicolo
                nome="foto_laterale_dx"
                label="Foto Laterale Destra"
                file={
                  fotoVeicolo
                    .foto_laterale_dx
                }
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_laterale_dx"
                  )
                }
              />

              <FormFotoVeicolo
                nome="foto_aggiuntiva_uno"
                label="Foto Aggiuntiva 1"
                file={
                  fotoVeicolo
                    .foto_aggiuntiva_uno
                }
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_aggiuntiva_uno"
                  )
                }
              />

              <FormFotoVeicolo
                nome="foto_aggiuntiva_due"
                label="Foto Aggiuntiva 2"
                file={
                  fotoVeicolo
                    .foto_aggiuntiva_due
                }
                onchange={
                  handleFotoVeicoloChange
                }
                onRemove={() =>
                  removeFotoVeicolo(
                    "foto_aggiuntiva_due"
                  )
                }
              />

            </div>

          </div>

          {/* ===============================================================
              BUTTON
          =============================================================== */}

          <div
            id="sevenStep"

            className={`
              ${
                sixStep
                  ? ""
                  : "hidden"
              }

              flex
              flex-col
              items-end
              gap-3
              h-fit
              w-full
            `}
          >

            <button
              type="submit"

              disabled={
                anyUploading ||
                statusSend
              }

              className="
                border
                border-brand
                bg-brand
                text-white
                px-6
                py-1
                text-xs
                rounded-xl
                font-semibold
                transition
                disabled:opacity-60
                lg:w-fit
                w-full
                h-8
                flex
                justify-center
                items-center
                gap-2
              "
            >

              {
                statusSend
                  ? (
                    <>
                      <AiOutlineLoading3Quarters
                        className="
                          animate-spin
                        "
                      />

                      Salvataggio...
                    </>
                  )

                  : anyUploading
                    ? "Caricamento documenti..."

                    : "Inserisci"
              }

            </button>

          </div>

        </form>

      </div>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| FORM FIELD
|--------------------------------------------------------------------------
*/

export function FormField({
  basis,
  nome,
  label,
  value,
  onchange,
  type,
  status = "",
}) {

  return (
    <div
      className={`
        ${basis}
        min-w-0
        ${status}
      `}
    >

      <Label
        htmlFor={nome}
      >
        {label}
      </Label>

      <Input
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value ?? ""}
        onChange={onchange}
        className="
          w-full
          min-w-0
          appearance-none
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
          focus-visible:ring-offset-background
          focus-visible:border-brand
        "
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FORM SELECT
|--------------------------------------------------------------------------
*/

export function FormSelect({
  basis,
  nome,
  label,
  value,
  onchange,
  options = [],
}) {

  const handleValueChange =
    (val) => {

      onchange?.({
        target: {
          name: nome,
          value: val,
        },
      });

    };

  return (
    <div
      className={`
        ${basis}
        min-w-0
      `}
    >

      <label
        className="
          block
          text-sm
          font-semibold
          mb-1
        "
        htmlFor={nome}
      >
        {label}
      </label>

      <Select
        value={
          value ?? ""
        }
        onValueChange={
          handleValueChange
        }
      >

        <SelectTrigger
          id={nome}
          className="
            rounded-lg
          "
        >

          <SelectValue
            placeholder={
              `-- Seleziona ${label} --`
            }
          />

        </SelectTrigger>

        <SelectContent
          position="popper"
          className="z-[70]"
        >

          <SelectGroup>

            {
              options.map(
                (
                  opt,
                  idx
                ) => (

                  <SelectItem
                    key={idx}
                    value={
                      String(opt)
                    }
                    className="
                      data-[state=checked]:bg-brand
                      data-[state=checked]:text-foreground
                      focus:bg-brand
                    "
                  >
                    {
                      String(opt)
                    }
                  </SelectItem>

                )
              )
            }

          </SelectGroup>

        </SelectContent>

      </Select>

      <input
        type="hidden"
        name={nome}
        value={
          value ?? ""
        }
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CHECKBOX
|--------------------------------------------------------------------------
*/

export function FormCheckBox({
  basis,
  nome,
  label,
  value,
  onchange,
}) {

  return (
    <div
      className={`
        ${basis}
        min-w-0
        flex
        flex-col
        items-center
        gap-2
        border
        px-4
        py-2
        rounded-xl
      `}
    >

      <Label
        htmlFor={nome}
      >
        {label}
      </Label>

      <div
        className="
          flex
          justify-center
          items-center
          h-full
          w-full
        "
      >

        <Checkbox
          id={nome}
          checked={
            !!value
          }
          onCheckedChange={
            (checked) => {

              const bool =
                checked === true;

              onchange?.({
                target: {
                  name: nome,
                  checked: bool,
                },
              });

            }
          }
          className="
            h-4
            w-4
            shrink-0
            rounded
            border
            border-gray-400
            data-[state=checked]:bg-brand
            data-[state=checked]:border-brand
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand
          "
        />

      </div>

      <input
        type="hidden"
        name={nome}
        value={
          value
            ? "true"
            : "false"
        }
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SELECT OPTIONS
|--------------------------------------------------------------------------
*/

export function FormSelectRuoli({
  basis,
  nome,
  label,
  value,
  onchange,
  options = [],
}) {

  const handleValueChange =
    (val) => {

      onchange?.({
        target: {
          name: nome,
          value: val,
        },
      });

    };

  return (
    <div
      className={`
        ${basis}
        min-w-0
      `}
    >

      <label
        className="
          block
          text-sm
          font-semibold
          mb-1
        "
        htmlFor={nome}
      >
        {label}
      </label>

      <Select
        value={
          value ?? ""
        }
        onValueChange={
          handleValueChange
        }
      >

        <SelectTrigger
          id={nome}
          className="
            w-full
            rounded-lg
          "
        >

          <SelectValue
            placeholder={
              `-- Seleziona ${label} --`
            }
          />

        </SelectTrigger>

        <SelectContent
          position="popper"
          className="z-[70]"
        >

          <SelectGroup>

            {
              options.map(
                (opt) => (

                  <SelectItem
                    key={
                      opt.value
                    }
                    value={
                      opt.value
                    }
                    className="
                      data-[state=checked]:bg-brand
                      data-[state=checked]:text-foreground
                      focus:bg-brand
                    "
                  >
                    {
                      opt.label
                    }
                  </SelectItem>

                )
              )
            }

          </SelectGroup>

        </SelectContent>

      </Select>

      <input
        type="hidden"
        name={nome}
        value={
          value ?? ""
        }
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FOTO VEICOLO
|--------------------------------------------------------------------------
|
| Questo componente NON effettua upload.
|
| Mantiene il File nel browser.
|
| L'upload avviene nel submit dopo aver generato UUID.
|
*/

export function FormFotoVeicolo({ nome, label, file, onchange, onRemove }) {

  const [preview, setPreview] = useState(null);

  useEffect(() => {

    if (!file) {

      setPreview(null);

      return;
    }

    if (
      !file.type
        ?.startsWith(
          "image/"
        )
    ) {

      setPreview(null);

      return;
    }

    const url =
      URL.createObjectURL(
        file
      );

    setPreview(url);

    return () => {

      URL.revokeObjectURL(
        url
      );

    };

  }, [file]);

  return (
    <div className="min-w-0 flex flex-col gap-2">

      <Label htmlFor={nome}>
        {label}
      </Label>

      <Input
        id={nome}
        name={nome}
        type="file"
        accept="
          .jpg,
          .jpeg,
          .png,
          .webp
        "
        onChange={onchange}
        className="
          w-full
          min-w-0
          file:mr-3
          file:rounded-lg
          file:border
          file:px-3
          file:py-1
          file:text-xs
          file:bg-brand
          file:text-white
          file:border-brand
          hover:file:opacity-90
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
        "
      />

      <p
        className="
          text-[0.65rem]
          text-neutral-500
        "
      >
        JPG, PNG o WEBP • Max 15 MB
      </p>

      {
        preview && (

          <div
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              bg-neutral-100
              dark:bg-neutral-950
              group
            "
          >

            <div
              className="
                aspect-video
                overflow-hidden
              "
            >

              <img
                src={preview}
                alt={label}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />

            </div>

            <div
              className="
                absolute
                top-2
                right-2
              "
            >

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="
                  h-8
                  w-8
                  rounded-full
                "
                onClick={
                  onRemove
                }
              >

                <Trash2
                  className="
                    h-4
                    w-4
                  "
                />

              </Button>

            </div>

            <div
              className="
                px-3
                py-2
                text-xs
                truncate
                bg-white
                dark:bg-neutral-900
              "
            >
              {
                file.name
              }
            </div>

          </div>

        )
      }

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| UPLOAD DOCUMENTI
|--------------------------------------------------------------------------
*/

export function FormFileUpload({
  targa = "",
  basis,
  campo = "",
  nome,
  label,
  bucket,
  pathPrefix = "public",
  accept = "",
  multiple = false,
  maxSizeMB = 15,
  makePublic = true,
  signedUrlSeconds = 3600,
  onchange,
  onBusyChange,
  helpText = "",
  resetToken,
}) {

  const [queue, setQueue] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const inputRef =
    useRef(null);

  if (!bucket) {

    console.error(
      'FormFileUpload: prop "bucket" è obbligatoria.'
    );

  }

  const bytesToMB =
    (b) =>
      (
        b /
        (
          1024 *
          1024
        )
      ).toFixed(2);

  const slugify =
    (s) =>
      String(s)
        .normalize("NFKD")
        .replace(
          /[^\w.\-]+/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | SANITIZE PATH
  |--------------------------------------------------------------------------
  */

  const sanitizePathPrefix =
    (pp) => {

      if (!pp) return "";

      return String(pp)
        .split("/")
        .map(
          (seg) =>
            String(
              seg || ""
            ).trim()
        )
        .filter(
          (seg) =>
            seg.length > 0
        )
        .map(
          (seg) =>
            seg
              .normalize(
                "NFKD"
              )
              .replace(
                /[^\w.\-]+/g,
                "-"
              )
              .replace(
                /-+/g,
                "-"
              )
              .toLowerCase()
        )
        .join("/");

    };

  /*
  |--------------------------------------------------------------------------
  | CLEANUP PREVIEW
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    return () => {

      previews.forEach(
        (p) =>
          URL.revokeObjectURL(
            p.url
          )
      );

    };

  }, [previews]);

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    previews.forEach(
      (p) =>
        URL.revokeObjectURL(
          p.url
        )
    );

    setQueue([]);

    setPreviews([]);

    if (
      inputRef.current
    ) {

      inputRef.current.value =
        "";

    }

    onchange?.({
      target: {
        name: nome,
        files: [],
      },
    });

  }, [resetToken]);

  /*
  |--------------------------------------------------------------------------
  | BUCKET EXISTS
  |--------------------------------------------------------------------------
  */

  async function bucketExists(
    name
  ) {

    const {
      error,
    } = await supabase
      .storage
      .from(name)
      .list(
        "",
        {
          limit: 1,
        }
      );

    if (
      error
    ) {

      console.error(
        `[bucketExists] "${name}" non accessibile:`,
        error.message
      );

      return false;

    }

    return true;

  }

  /*
  |--------------------------------------------------------------------------
  | UPLOAD
  |--------------------------------------------------------------------------
  */

  async function uploadOne(
    file,
    idx,
    finalPath
  ) {

    try {

      setQueue(
        (q) =>
          q.map(
            (
              it,
              i
            ) =>
              i === idx

                ? {
                    ...it,
                    status:
                      "uploading",
                  }

                : it
          )
      );

      const {
        error:
          upErr,
      } = await supabase
        .storage
        .from(bucket)
        .upload(
          finalPath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              true,

            contentType:
              file.type ||
              "application/octet-stream",
          }
        );

      if (
        upErr
      ) {

        console.error(
          "[uploadOne] storage.upload error:",
          upErr.message
        );

        setQueue(
          (q) =>
            q.map(
              (
                it,
                i
              ) =>
                i === idx

                  ? {
                      ...it,
                      status:
                        "error",
                      err:
                        upErr,
                    }

                  : it
            )
        );

        return null;

      }

      let url = "";

      if (
        makePublic
      ) {

        const {
          data:
            pub,
        } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(
            finalPath
          );

        url =
          pub?.publicUrl ||
          "";

      } else {

        const {
          data:
            signed,

          error:
            sErr,
        } = await supabase
          .storage
          .from(bucket)
          .createSignedUrl(
            finalPath,
            parseInt(
              signedUrlSeconds,
              10
            )
          );

        if (
          sErr
        ) {

          console.error(
            "[uploadOne] createSignedUrl error:",
            sErr
          );

        } else {

          url =
            signed?.signedUrl ||
            "";

        }

      }

      setQueue(
        (q) =>
          q.map(
            (
              it,
              i
            ) =>
              i === idx

                ? {
                    ...it,
                    status:
                      "done",
                    path:
                      finalPath,
                    url,
                  }

                : it
          )
      );

      return {
        path:
          finalPath,

        url,

        name:
          file.name,

        size:
          file.size,

        type:
          file.type,
      };

    } catch (
      error
    ) {

      console.error(
        "[uploadOne] catch:",
        error
      );

      setQueue(
        (q) =>
          q.map(
            (
              it,
              i
            ) =>
              i === idx

                ? {
                    ...it,
                    status:
                      "error",
                    err:
                      error,
                  }

                : it
          )
      );

      return null;

    }

  }

  /*
  |--------------------------------------------------------------------------
  | FILE SELECTED
  |--------------------------------------------------------------------------
  */

  async function handleFilesSelected(
    e
  ) {

    const list =
      e.target.files ||
      [];

    const files =
      Array.from(list);

    if (
      !files.length
    ) {

      return;

    }

    onBusyChange?.(
      nome,
      true
    );

    const ok =
      await bucketExists(
        bucket
      );

    if (!ok) {

      onBusyChange?.(
        nome,
        false
      );

      return;

    }

    const maxBytes =
      maxSizeMB *
      1024 *
      1024;

    const initial =
      files.map(
        (file) => ({
          file,

          tooBig:
            file.size >
            maxBytes,

          status:
            file.size >
            maxBytes

              ? "error"

              : "pending",
        })
      );

    setPreviews(
      (prev) => {

        prev.forEach(
          (p) =>
            URL.revokeObjectURL(
              p.url
            )
        );

        return files
          .filter(
            (file) =>
              file.type
                ?.startsWith(
                  "image/"
                )
          )
          .map(
            (file) => ({
              name:
                file.name,

              url:
                URL.createObjectURL(
                  file
                ),
            })
          );

      }
    );

    setQueue(
      initial
    );

    const today =
      new Date();

    const safeTarga =
      slugify(
        targa ||
        "no-targa"
      );

    const safeCampo =
      slugify(
        campo ||
        "file"
      );

    const prefix =
      sanitizePathPrefix(
        pathPrefix
      );

    const base =
      prefix
        ? `${prefix}/`
        : "";

    const uploadedResults =
      [];

    for (
      let i = 0;
      i < initial.length;
      i++
    ) {

      const item =
        initial[i];

      if (
        item.tooBig
      ) {

        console.warn(
          `"${item.file.name}" supera ${maxSizeMB} MB`
        );

        continue;

      }

      const ext =
        (
          item.file.name
            .split(".")
            .pop()

          ||

          "jpg"
        ).toLowerCase();

      const finalPath =
        `${base}${safeTarga}-${safeCampo}.${ext}`;

      const res =
        await uploadOne(
          item.file,
          i,
          finalPath
        );

      if (
        res
      ) {

        uploadedResults.push(
          res
        );

      }

    }

    onchange?.({
      target: {
        name: nome,
        files:
          uploadedResults,
      },
    });

    onBusyChange?.(
      nome,
      false
    );

  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={
        (
          targa.length >= 3 &&
          targa.length <= 8
        )

          ? cn(
              basis,
              "min-w-0"
            )

          : "hidden"
      }
    >

      <Label
        htmlFor={nome}
      >
        {label}
      </Label>

      <Input
        ref={inputRef}
        id={nome}
        name={nome}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={
          handleFilesSelected
        }
        className="
          w-full
          min-w-0

          file:mr-3
          file:rounded-lg
          file:border
          file:px-3
          file:py-1
          file:text-xs
          file:bg-brand
          file:text-white
          file:border-brand

          hover:file:opacity-90

          focus:outline-none

          focus-visible:ring-2
          focus-visible:ring-brand
          focus-visible:ring-offset-2
        "
      />

      {
        helpText && (

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            {helpText}
          </p>

        )
      }

      <p
        className="
          mt-1
          text-[0.65rem]
          text-neutral-500
        "
      >
        Max {maxSizeMB} MB per file
        {
          multiple
            ? " (multipli consentiti)"
            : ""
        }
      </p>

      {
        queue.length > 0 && (

          <div
            className="
              mt-3
              space-y-2
            "
          >

            {
              queue.map(
                (
                  item,
                  i
                ) => (

                  <div
                    key={i}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      border
                      p-2
                      text-sm
                    "
                  >

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <div
                        className="
                          truncate
                          font-medium
                        "
                      >
                        {
                          item.file.name
                        }
                      </div>

                      <div
                        className="
                          text-xs
                          text-neutral-500
                        "
                      >
                        {
                          bytesToMB(
                            item.file.size
                          )
                        } MB
                        {" • "}
                        {
                          item.file.type ||
                          "file"
                        }
                      </div>

                    </div>

                    <div
                      className="
                        ml-3
                        w-28
                        flex
                        items-center
                        justify-end
                      "
                    >

                      {
                        item.status ===
                          "pending" && (

                          <span
                            className="
                              text-xs
                            "
                          >
                            in coda…
                          </span>

                        )
                      }

                      {
                        item.status ===
                          "uploading" && (

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              text-xs
                            "
                          >

                            <AiOutlineLoading3Quarters
                              className="
                                h-4
                                w-4
                                animate-spin
                              "
                            />

                            <span>
                              carico…
                            </span>

                          </div>

                        )
                      }

                      {
                        item.status ===
                          "done" && (

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              text-green-600
                            "
                          >

                            <AiOutlineCheck
                              className="
                                h-4
                                w-4
                              "
                            />

                            <span>
                              ok
                            </span>

                          </div>

                        )
                      }

                      {
                        item.status ===
                          "error" && (

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              text-red-600
                            "
                          >

                            <AiOutlineClose
                              className="
                                h-4
                                w-4
                              "
                            />

                            <span>
                              errore
                            </span>

                          </div>

                        )
                      }

                    </div>

                  </div>

                )
              )
            }

          </div>

        )
      }

      {
        previews.length > 0 && (

          <div
            className="
              mt-3
              grid
              grid-cols-2
              sm:flex
              sm:flex-wrap
              gap-2
            "
          >

            {
              previews.map(
                (
                  preview,
                  i
                ) => (

                  <div
                    key={i}
                    className="
                      w-36
                      border
                      rounded-lg
                      p-2
                      bg-neutral-50
                      dark:bg-neutral-900
                    "
                  >

                    <div
                      className="
                        aspect-video
                        overflow-hidden
                        rounded
                      "
                    >

                      <img
                        src={
                          preview.url
                        }
                        alt={
                          preview.name
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    </div>

                    <div
                      className="
                        mt-1
                        truncate
                        text-[0.7rem]
                      "
                    >
                      {
                        preview.name
                      }
                    </div>

                  </div>

                )
              )
            }

          </div>

        )
      }

    </div>
  );
}