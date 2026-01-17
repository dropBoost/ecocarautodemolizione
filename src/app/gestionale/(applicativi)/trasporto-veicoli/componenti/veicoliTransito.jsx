"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaCheckSquare, FaSquare } from "react-icons/fa";
import { useAdmin } from "@/app/admin/components/AdminContext";
import TargaDesign from "@/app/componenti/targaDesign";
import { Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue,  SelectGroup } from "@/components/ui/select";

export default function SECTIONveicoliTransito({ onDisplay, setStatusAziende, statusAziende }) {
  const utente = useAdmin();
  const role = utente?.utente?.user_metadata.ruolo;
  const uuidUtente = utente?.utente?.id;
  const [updateList, setUpdateList] = useState(true);
  const [veicoliInConsegna, setVeicoliInConsegna] = useState([]);
  const [veicoliConsegnati, setVeicoliConsegnati] = useState([]);
  const isAdmin = role === "admin" || role === "superadmin";
  const isTrasporter = role === "transporter";
  const isCompany = role === "company";

  //CARICAMENTO VEICOLI IN CONSEGNA
  useEffect(() => {
    if (!role) return;
    if ((!isAdmin || !isTrasporter || isCompany) && !uuidUtente) return;

    const fetchData = async () => {
      let query = supabase
        .from("dati_veicolo_ritirato")
        .select(
          `*,
				aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv)
				)`
        )
				.eq("veicolo_ritirato", true)
				.eq("veicolo_consegnato", false)
				.eq("demolizione_approvata", true)
        .eq("pratica_completata", false);
        
      if (isCompany) {
        query = query.eq("uuid_azienda_ritiro_veicoli", uuidUtente);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliInConsegna(data ?? []);
    };

    fetchData();
  }, [role, uuidUtente, updateList, statusAziende]);

  //CARICAMENTO VEICOLI CONSEGNATI
  useEffect(() => {
    if (!role) return;
    if ((!isAdmin || !isTrasporter || isCompany) && !uuidUtente) return;

    const fetchData = async () => {
      let query = supabase
        .from("dati_veicolo_ritirato")
        .select(
          `*, aziendaRitiro:azienda_ritiro_veicoli(ragione_sociale_arv))`
        )
				.eq("pratica_completata", false)
        .eq("veicolo_consegnato", true)
				.eq("veicolo_ritirato", true)

      if (isTrasporter) {
        query = query.eq("uuid_autista_ctv", uuidUtente);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        return;
      }

      setVeicoliConsegnati(data ?? []);
    };

    fetchData();
  }, [role, uuidUtente, updateList]);

  async function StatusUpdate(uuidVeicolo, uuidStatoAvanzamento) {

		const payloadStatus = {
			uuid_veicolo_ritirato: uuidVeicolo,
			uuid_stato_avanzamento: uuidStatoAvanzamento,
		};

		const { data, error } = await supabase
			.from("log_avanzamento_demolizione")
			.insert(payloadStatus)
			.select()
			.single();

		if (error) {
			console.log("Errore statusUpdate:", error);
		} else {
			console.log("Stato aggiornato:", data);
		}

	}

	async function StatusDowngrade(uuidVeicolo, uuidStatoAvanzamento) {

		const { data, error } = await supabase
			.from("log_avanzamento_demolizione")
      .delete()
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
			.eq("uuid_stato_avanzamento", uuidStatoAvanzamento)

		if (error) {
			console.log("Errore statusUpdate:", error);
		} else {
			console.log("Stato aggiornato:", data);
		}

	}  

  // INSERIMENTO CONSEGNA
  async function ConsegnaVeicolo(uuidVeicolo) {
    if (!uuidVeicolo) return alert("seleziona un veicolo");

    const payloadVR = {
      veicolo_consegnato: true,
    };

    const { data: vrData, error: vrError } = await supabase
      .from("dati_veicolo_ritirato")
      .update(payloadVR)
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
      .select()
      .single();

    if (vrError) {
      console.error(vrError);
      alert(`Errore salvataggio: ${vrError.message}`);
      return;
    }

    await StatusUpdate(uuidVeicolo, "95c6e1d5-94fc-40df-b5db-08e9bf36e730") //CONSEGNATO

    setUpdateList((prev) => !prev);
		setStatusAziende(prev => !prev)

    alert("Consegna inserita con successo");
  }

  // ELIMINA CONSEGNA
  async function EliminaConsegna(uuidVeicolo) {
    if (!uuidVeicolo) return alert("seleziona un veicolo");

    const payloadVR = {
      veicolo_consegnato: false,
    };

    const { data: vrData, error: vrError } = await supabase
      .from("dati_veicolo_ritirato")
      .update(payloadVR)
      .eq("uuid_veicolo_ritirato", uuidVeicolo)
			.eq("pratica_completata", false)
      .select()
      .single();

    if (vrError) {
      console.error(vrError);
      alert(`Errore salvataggio: ${vrError.message}`);
      return;
    }

    await StatusDowngrade(uuidVeicolo, "6adcebac-b5db-452a-974d-912e1caab37b") //ELIMINA CONSEGNATO

    setUpdateList((prev) => !prev);
		setStatusAziende(prev => !prev)

    alert("Consegna Eliminata");
  }

	if (role == "admin" || role == "superadmin") {
		return (
			<>
				<div className={`${onDisplay === true && veicoliInConsegna.length > 0 ? "" : "hidden"} w-full h-full`}>
					<div className="flex lg:flex-row flex-col flex-wrap lg:gap-y-3 gap-y-1 w-full min-h-0">
						{/* CRUSCOTTO */}
						{/* <div className="flex flex-row w-full gap-4 min-h-0 p-5 rounded-2xl bg-neutral-950">
							<div className="flex flex-row justify-between">
								<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
									CRUSCOTTO
								</h4>
							</div>
						</div> */}
						{/* VEICOLI DA CONSEGNARE */}
						<div className="flex flex-col gap-4 xl:basis-6/12 w-full p-1 h-60 overflow-auto">
							<div className="flex flex-col border border-brand p-5 rounded-2xl h-full gap-2">
								<div className="flex flex-row justify-between">
									<h4 className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
										VEICOLI IN CONSEGNA
									</h4>
								</div>
								<div className="flex flex-col gap-2 overflow-auto">
									{veicoliInConsegna?.map((c, i) => (
										<div key={c.uuid_veicolo_ritirato} className="flex flex-row justify-between border py-2 px-4 rounded-xl">
											<div className="flex flex-row items-center gap-3">
												<div className="w-36">
													<TargaDesign targa={c?.targa_veicolo_ritirato} />
												</div>
												<span className="text-xs">
													{c?.aziendaRitiro?.ragione_sociale_arv}
												</span>
											</div>
											<div className="flex items-center">
												<ButtonRitiraVeicolo onClick={() => ConsegnaVeicolo(c?.uuid_veicolo_ritirato)}/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						{/* VEICOLI CONSEGNATI */}
						<div className="flex flex-col gap-2 xl:basis-6/12 w-full p-1 h-60">
							<div className="flex flex-col border border-brand p-5 rounded-2xl h-full gap-2">
								<div className="flex flex-row justify-between items-start">
									<h4 className="h-fit text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl">
										VEICOLI CONSEGNATI
									</h4>
								</div>
								<div className="flex flex-col gap-2 overflow-auto">
									{veicoliConsegnati?.map((vr, i) => (
										<div key={vr.uuid_veicolo_ritirato} className="flex flex-row justify-between border py-2 px-4 rounded-xl">
											<div className="flex flex-row items-center gap-3">
												<div className="w-36">
													<TargaDesign targa={vr?.targa_veicolo_ritirato}/>
												</div>
												<span className="text-xs">{vr?.aziendaRitiro?.ragione_sociale_arv}</span>
											</div>
											<div className="flex items-center">
												<ButtonEliminaRitira onClick={() => EliminaConsegna( vr?.uuid_veicolo_ritirato )}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
						{/* INSERIMENTO AUTISTA
						<div className="flex flex-col gap-4 w-full bg-neutral-950 p-5 rounded-2xl">
							ciaoii
						</div> */}
					</div>
				</div>
			</>
		)
	} else {
		return(
			<p>AUTORIZZAZIONE MANCANTE...</p>
		)
	};
}

export function ButtonRitiraVeicolo({ onClick }) {
  return (
    <>
      <button onClick={onClick}>
        <FaSquare  className="text-white dark:border-none border border-brand rounded-sm"/>
      </button>
    </>
  );
}

export function ButtonEliminaRitira({ onClick }) {
  return (
    <>
      <button onClick={onClick} className="text-brand">
        <FaCheckSquare/>
      </button>
    </>
  );
}

export function FormSelect({ nome, label, value, onchange, options = [] }) {
  const handleValueChange = (val) => {
    onchange?.({ target: { name: nome, value: val } });
  };
  return (
    <div className={`flex flex-col gap-2 w-full`}>
      <label
        className="text-[0.6rem] font-bold text-dark dark:text-brand border border-brand px-3 py-2 w-fit rounded-xl uppercase"
        htmlFor={nome}
      >
        {label}
      </label>
      <Select value={value ?? ""} onValueChange={handleValueChange}>
        <SelectTrigger id={nome} className="w-full rounded-lg">
          <SelectValue placeholder={`-- Seleziona ${label} --`} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[70]">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="data-[state=checked]:bg-brand data-[state=checked]:text-foreground focus:bg-brand"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <input type="hidden" name={nome} value={value ?? ""} />
    </div>
  );
}

export function FormField({ nome, label, value, onchange, type }) {
  return (
    <div className={`w-fit`}>
      <Input
        type={type}
        id={nome}
        placeholder={label}
        name={nome}
        value={value}
        onChange={onchange}
        className={`appearance-none rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-brand`}
      />
    </div>
  );
}
