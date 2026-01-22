import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { colorBrand, colorDark } from "@/app/cosetting";


const styles = StyleSheet.create({

  page: { 
    padding: 30,
  },
  mainPage: {
    flexDirection: "column",
    gap:10,
    justifyContent:"space-between",
    flex: 1,
  },
  mainSection: {
    flexDirection: "column",
    gap:10
  },
  sectionCol: {
    flexDirection: "column",
    gap:3
  },
  sectionColFooter: {
    flexDirection: "column",
    alignItems:"flex-end",
    justifyContent:"flex-end",
    gap:3
  },
  sectionColBorder: {
    flexDirection: "column",
    gap:3,
    borderWidth: 1,
    borderColor:"#222222",
    borderRadius: 10,
    padding: 10
  },
  sectionRow: {
    flexDirection: "row",
    gap:3,
    alignItems:"center",
    justifyContent:"space-between",
  },
  sectionRowInfo: {
    flexDirection: "row",
    gap:10,
    justifyContent:"space-between",
    alignItems:"flex-end"
  },
  sectionWrap: {
    flexDirection: "row",
    gap:3,
    alignItems:"center",
    justifyContent:"flex-start",
    flexWrap: "wrap"
  },
  sectionBorder: {
    flexDirection: "row",
    gap:3,
    borderWidth: 1,
    borderColor:"#222222",
    borderRadius: 10,
    padding: 10
  },
  sectionColor: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent:"space-between",
    gap:3,
    backgroundColor:`${colorBrand}`,
    color:"#ffffff",
    borderRadius: 10,
    padding: 10
  },
  sectionLegal: {
    display:"flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  itemBubble: {
    fontSize: 10,
    flexDirection: "row",
    gap:3,
    borderWidth: 1,
    borderColor:`${colorDark}`,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    alignItems:"center",
  },
  title: {
    fontSize: 11,
    textAlign: "center"
  },
  subTitle: {
    fontSize: 9,
    textAlign: "center"
  },
  p: { 
    fontSize: 8
  },
  label: { 
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor:`${colorBrand}`,
    color:"#ffffff",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    textTransform:"uppercase"
  },
  labelFooter: { 
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor:`${colorBrand}`,
    color:"#ffffff",
    alignSelf: "flex-end",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    textTransform:"uppercase"
  },
  value: { 
    fontSize: 10,
  },
  valueBold: { 
    fontSize: 10,
    fontWeight:900,
  },
  qrWrap: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrImg: {
    width: 50,
    height: 50,
  },
  qrText: {
    width: "70%",
    fontSize: 9,
  },
  markSpace: {
    position: "relative",
    width: 200,
    height: 100,
    borderWidth: 1,
    borderColor: colorDark,
    borderRadius: 7,
    overflow: "hidden",      // utile per non far uscire l'immagine dai bordi
    justifyContent: "center",
    alignItems: "center",
  },
  markBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",    // oppure "cover"
    opacity: 0.15,           // effetto watermark
  },
  imageWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageDoc: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

export default function RitiroVeicoloDOC(props) {
  const {
    uuidRitiroVeicolo,
    vinLeggibile,
    vin,
    targa,
    modello,
    tipologiaDetentore,
    formaLegale,
    ragioneSociale,
    indirizzo,
    nome,
    cognome,
    cf,
    piva,
    tipologiaDocDet,
    numeroDocDet,
    email,
    mobile,
    tipDocVeic,
    docGravami,
    praticaCompletata,
    dataRitiro,
    qrDataUrl,
    qrValue,
    logoSrc,
    iDocVeicoloF,
    iDocVeicoloR,
    iDocDetentoreF,
    iDocDetentoreR,
    iComplementareF,
    iComplementareR,
  } = props;

  const isPdf = (url) =>
  typeof url === "string" && url.split("?")[0].toLowerCase().endsWith(".pdf");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CONTENITORE PAGINA */}
        <View style={styles.mainPage}>
          {/* HEAD */}
          <View style={styles.mainSection}>
            {/* LOGO */}
            <View style={styles.sectionRow}>
              {logoSrc ? <Image src={logoSrc} style={{ width: 140, height: 40, marginBottom: 10, textAlign:"center",}} /> : null}
              {/* ✅ BLOCCO QR */}
              <Image style={styles.qrImg} src={qrDataUrl}/>
            </View>
            
            {/* TITOLO */}
            <View style={styles.sectionCol}>
              <Text style={styles.title}>PRESA IN CARICO PROVVISORIA PER IL TRASPORTO DI VEICOLI DESTINATI ALLA ROTTAMAZIONE</Text>
              <Text style={styles.subTitle}>Art.208 D.Lgs 152/06 – D.lgs. 209/03</Text>
            </View>
            {/* DETTAGLI PRATICA */}
            <View style={styles.sectionColor}>
              <Text style={styles.p}>
                Codice Pratica: <Text style={styles.value}>{uuidRitiroVeicolo}</Text>
              </Text>
              <Text style={styles.p}>
                Data: <Text style={styles.value}>{dataRitiro}</Text>
              </Text>
            </View>
          </View>
          {/* BODY */}
          <View style={styles.mainSection}>
            {/* VEICOLO */}
            <View style={styles.sectionCol}>
              <Text style={styles.label}>Veicolo:</Text>
              <View style={styles.sectionRow}>
                <Text style={styles.itemBubble}>Modello: <Text style={styles.valueBold}>{modello}</Text></Text>
                <Text style={styles.itemBubble}>Targa: <Text style={styles.valueBold}>{targa}</Text></Text>
                <Text style={styles.itemBubble}>Telaio: <Text style={{textTransform:"uppercase", fontWeight:900,}}>{vinLeggibile ? `${vin}` : "vin non leggibile"}</Text></Text>
              </View>
            </View>
            {tipologiaDetentore == "proprietario" ?
            <View style={styles.sectionCol}>
              <Text style={styles.label}>{tipologiaDetentore}</Text>
              <View style={styles.sectionColBorder}>
                <View style={styles.sectionWrap}>
                  <Text style={styles.value}>Forma Legale: <Text style={styles.valueBold}>{formaLegale}</Text></Text>
                  <Text style={styles.value}>{ragioneSociale == "azienda" ? <>Ragione Sociale: <Text style={styles.valueBold}>{ragioneSociale}</Text></> : null}</Text>
                  <Text style={styles.value}>{ragioneSociale == "azienda" ? <>P.IVA: <Text style={styles.valueBold}>{piva}</Text></> : <>Codice Fiscale: <Text style={styles.valueBold}>{cf}</Text></>}</Text>
                </View>
                <View style={styles.sectionWrap}>
                  <Text style={styles.value}>Nome e Cognome: <Text style={styles.valueBold}>{nome} {cognome}</Text></Text>
                  <Text style={styles.value}>Indirizzo: <Text style={styles.valueBold}>{indirizzo}</Text></Text>
                  <Text style={styles.value}>Documento: <Text style={styles.valueBold}>{tipologiaDocDet}</Text> n° <Text style={styles.valueBold}>{numeroDocDet}</Text></Text>
                </View>
              </View>
            </View> : null }
            {/* CONTATTI */}
            <View style={styles.sectionCol}>
              <Text style={styles.label}>CONTATTI</Text>
              <View style={styles.sectionColBorder}>
                <View style={styles.sectionWrap}>
                  <Text style={styles.value}>Email: <Text style={styles.valueBold}>{email}</Text></Text>
                  <Text style={styles.value}>Mobile: <Text style={styles.valueBold}>{mobile}</Text></Text>
                </View>
              </View>
            </View>
            {/* DOCUMENTI ALLEGATI */}
            <View style={styles.sectionCol}>
              <Text style={styles.label}>DOCUMENTI ALLEGATI</Text>
                <View style={styles.sectionColBorder}>
                <View style={styles.sectionWrap}>
                  <Text style={styles.value}>Documento Veicolo Ritirato: <Text style={styles.valueBold}>{tipDocVeic}</Text></Text>
                  <Text style={styles.value}>Visura: <Text style={styles.valueBold}>{docGravami}</Text></Text>
                  </View>
                </View>
            </View>
            {/* ✅ BLOCCO QR */}
            <View style={styles.sectionCol}>
              <Text style={styles.label}>Stato Pratica e Certificato di Demolizione</Text>
              <View style={styles.sectionColBorder}>
                <View style={styles.sectionRow}>
                  <View style={styles.sectionCol}>
                    <Text style={styles.value}>
                      Per verificare lo stato d'avanzemento della tua pratica e successivamente scaricare il certificato di demolizione appena la tua pratica sarà completata
                      scansiona il QR Code in alto a destra e monitora lo stato di avanzamento.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* FOOTER */}
          <View style={styles.sectionRowInfo}>
            {/* INFO LEGALI */}
            <View style={styles.sectionLegal}>
              <Text style={styles.p}>Clausola di responsabilità e presa in carico del veicolo fuori uso
              Ai sensi del D.Lgs. 24 giugno 2003 n. 209 e successive modificazioni, il presente centro di raccolta autorizzato
              dichiara di aver preso in carico il veicolo fuori uso ai fini della messa in sicurezza, del trattamento e della successiva
              radiazione dal Pubblico Registro Automobilistico (P.R.A.), assumendo la responsabilità della corretta gestione del
              mezzo in conformità alla normativa ambientale vigente.
              Il centro di raccolta si impegna a garantire il rispetto delle disposizioni in materia di deposito, bonifica, recupero e
              smaltimento dei componenti e dei materiali pericolosi, esonerando il precedente detentore o proprietario da ogni
              responsabilità ambientale e amministrativa connessa al veicolo a decorrere dalla data di presa in carico.
              Resta inteso che la responsabilità del centro decorre esclusivamente dal momento della presa in carico fisica del
              veicolo e limitatamente alle operazioni effettuate nell’ambito della propria autorizzazione.
              </Text>
            </View>
            {/* APPROVAZIONE E FIRMA */}
            <View style={styles.sectionColFooter}>
              <Text style={styles.labelFooter}>Timbro e Firma</Text>
              <View style={styles.markSpace}>
                {logoSrc ? <Image src={logoSrc} style={styles.markBg} /> : null}

                {/* contenuto sopra lo sfondo */}
                <Text style={{ fontSize: 10 }}><b>ECOCAR s.a.s. di Cavagnoli Ciro & C.</b></Text>
                <Text style={{ fontSize: 10 }}>Zona Industriale ASI Località Pantano</Text>
                <Text style={{ fontSize: 10 }}>80011 Acerra (NA)</Text>
                <Text style={{ fontSize: 10 }}>P.IVA/C.F.: 03913251215</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
      {/* {iDocVeicoloF && !isPdf(iDocVeicoloF) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <Image src={iDocVeicoloF} style={styles.imageDoc} />
          </View>
        </View>
      </Page> ) : null }
      {iDocVeicoloR && !isPdf(iDocVeicoloR) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <Image src={iDocVeicoloR} style={styles.imageDoc} />
          </View>
        </View>
      </Page> ) : null }
      {iDocDetentoreF && !isPdf(iDocDetentoreF) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <View style={styles.sectionCol}>
              <Image src={iDocDetentoreF} style={styles.imageDoc} />
            </View>
          </View>
        </View>
      </Page> ) : null }
      {iDocDetentoreR && !isPdf(iDocDetentoreR) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <View style={styles.sectionCol}>
              <Image src={iDocDetentoreR} style={styles.imageDoc} />
            </View>
          </View>
        </View>
      </Page> ) : null }
      {iComplementareF && !isPdf(iComplementareF) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <Image src={iComplementareF} style={styles.imageDoc} />
          </View>
        </View>
      </Page> ) : null }
      {iComplementareR && !isPdf(iComplementareR) ? (
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          <View style={styles.mainSection}>
            <Image src={iComplementareR} style={styles.imageDoc} />
          </View>
        </View>
      </Page> ) : null } */}
    </Document>
  );
}
