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
    flexDirection: "col",
    gap:3
  },
  sectionColFooter: {
    flexDirection: "col",
    alignItems:"flex-end",
    justifyContent:"flex-end",
    gap:3
  },
  sectionColBorder: {
    flexDirection: "col",
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
    display:"flex",
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 100,
    borderWidth: 1,
    borderColor:`${colorDark}`,
    borderRadius: 7,
  },
  imageDoc: {
    height: "100%",
    objectFit: "contain", // oppure "cover"
  }
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CONTENITORE PAGINA */}
        <View style={styles.mainPage}>
          {/* HEAD */}
          <View style={styles.mainSection}>
            {/* LOGO */}
            {logoSrc ? <Image src={logoSrc} style={{ width: 140, height: 40, marginBottom: 10, textAlign:"center",}} /> : null}
            {/* TITOLO */}
            <View style={styles.sectionCol}>
              <Text style={styles.title}>PRESA IN CARICO PROVVISORIA PER IL TRASPORTO<br/>DI VEICOLI DESTINATI ALLA ROTTAMAZIONE</Text>
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
            {(qrDataUrl || qrValue) && (
              <View style={styles.sectionCol}>
                <Text style={styles.label}>Stato Pratica e Certificato di Demolizione</Text>
                <View style={styles.sectionColBorder}>
                  <View style={styles.sectionRow}>
                    <View style={styles.sectionCol}>
                      <Text style={styles.value}>
                        Per verificare lo stato d'avanzemento della tua pratica e per scaricare il certificato di demolizione una volta completata
                        scansiona il QR oppure visita il sito ecocarautodemolizione.it e clicca sulla apposita area dedicata ed inserisci i dati richiesti.</Text>
                      {qrDataUrl ? <Image style={styles.qrImg} src={qrDataUrl} /> : null}
                    </View>
                  </View>
                </View>
              </View>
            )}
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
                {logoSrc ? <Image src={logoSrc} style={{ width: 90, marginBottom: 10, textAlign:"center", opacity:0.3}} /> : null}
              </View>
            </View>
          </View>
        </View>
      </Page>
      {iDocVeicoloF ?
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          {/* SEZIONE 1 */}
          <View style={styles.mainSection}>
            {iDocVeicoloF ? <Image src={iDocVeicoloF} style={styles.imageDoc} /> : null}
          </View>
          </View>
      </Page> : null }
      {iDocVeicoloR ?
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          {/* SEZIONE 1 */}
          <View style={styles.mainSection}>
            {iDocVeicoloR ? <Image src={iDocVeicoloR} style={styles.imageDoc} /> : null}
          </View>
          </View>
      </Page> : null }
      {iDocDetentoreF && iDocDetentoreR ?
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          {/* SEZIONE 1 */}
          <View style={styles.mainSection}>
            <View style={styles.sectionCol}>
              {iDocDetentoreF ? <Image src={iDocDetentoreF} style={styles.imageDoc} /> : null}
              {iDocDetentoreR ? <Image src={iDocDetentoreR} style={styles.imageDoc} /> : null}
            </View>
          </View>
        </View>
      </Page> : null }
      {iComplementareF ?
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          {/* SEZIONE 1 */}
          <View style={styles.mainSection}>
            {iComplementareF ? <Image src={iComplementareF} style={styles.imageDoc} /> : null}
          </View>
          </View>
      </Page> : null }
      {iComplementareR ?
      <Page size="A4" style={styles.page}>
        <View style={styles.mainPage}>
          {/* SEZIONE 1 */}
          <View style={styles.mainSection}>
            {iComplementareR ? <Image src={iComplementareR} style={styles.imageDoc} /> : null}
          </View>
          </View>
      </Page> : null }
    </Document>
  );
}
