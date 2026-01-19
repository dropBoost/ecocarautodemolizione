import { FaCarCrash, FaFacebookSquare, FaWhatsappSquare, FaInstagramSquare, FaPhoneSquareAlt, FaEnvelope, FaUserCheck, FaUser, FaFileInvoiceDollar, FaUsers, FaArchive, FaHome } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { MdDashboard, MdOutlinePointOfSale } from "react-icons/md";
import { BiSolidReport } from "react-icons/bi";
import { GiTowTruck } from "react-icons/gi";
import { TbEngine, TbBuildingSkyscraper } from "react-icons/tb";
import { FaCar, FaCarOn } from "react-icons/fa6";
import { SiGoogleforms } from "react-icons/si";

//ICONE SOCIAL

const ICONfacebook = <FaFacebookSquare/>
const ICONwhatsApp = <FaWhatsappSquare/>
const ICONtikTok = <AiFillTikTok />
const ICONinstagram = <FaInstagramSquare/>
const ICONtel = <FaPhoneSquareAlt/>
const ICONemail = <FaEnvelope/>

//ICONE GESTIONALE

const ICON0 = <FaHome/>
const ICON1 = <MdDashboard/>
const ICON2 = <GiTowTruck/>
const ICON3 = <FaCarCrash/>
const ICON4 = <BiSolidReport/>
const ICON5 = <TbEngine/>
const ICON6 = <FaCar/>
const ICON7 = <FaUsers/>
const ICON8 = <FaArchive/>
const ICON9 = <MdOutlinePointOfSale/>
const ICON10 = <SiGoogleforms/>
const ICON11 = <FaUserCheck/>
const ICON12 = <TbBuildingSkyscraper/>
const ICON13 = <FaCarOn/>

// FOOTER SIGN

export const poweredBy = "powered 💜 dropboost.it"
export const version = "1.1.0"

// PERSONALIZZAZIONI

export const dominio = "https://ecocarautodemolizione.it/"
export const companyName = "ECOCAR Autodemolizione"
export const logoDark = "/logo-black.png"
export const logoLight = "/logo-white.png"
export const logoFullDark = "/logo-fullblack.png"
export const logoFullLight = "/logo-fullwhite.png"
export const logoExtendedDark = "/logo-extended-black.png"
export const logoExtendedLight = "/logo-extended-white.png"
export const logoExtendedFullDark = "/logo-extended-fullblack.png"
export const logoExtendedFullLight = "/logo-extended-fullwhite.png"
export const colorBrand = "#253a60"
export const colorBrandARGB = "FF253a60"
export const colorBrandSecondary = "#be1622"
export const colorDark = "#222222"
export const whatsAppContactLink = "#"
export const emailContact = "info@ecocarautodemolizioni.it"

// SOCIAL

export const socialLink = [
    {name:'whatsApp',link:whatsAppContactLink,icon: ICONwhatsApp, info:"+39 366 35 85 395",attivoWeb:"true"},
    {name:'facebook',link:'fasc',icon: ICONfacebook, info:"@facebbok",attivoWeb:"true"},
    {name:'instagram',link:'#',icon: ICONinstagram, info:"@instagram",attivoWeb:"true"},
    {name:'tiktok',link:'#',icon: ICONtikTok, info:"@tiktok",attivoWeb:"false"},
    {name:'email',link:'#',icon: ICONemail, info:"info@ecocarautodemolizioni.it",attivoWeb:"true"},
    {name:'tel',link:'dsda',icon: ICONtel, info:"+393293968096",attivoWeb:"true"},
  ]

// MODULI GESTIONALE

export const moduliGestionale = [
    {name:'home', link:'/gestionale', linkActive:'home', icon: ICON0, label:'home', attivo:true, level:['admin', 'superadmin', 'company']},
    {name:'dashboard', link:'/gestionale/dashboard', linkActive:'dashboard', icon: ICON1, label:'dashboard', attivo:false, level:['admin', 'superadmin']},
    {name:'azienda ritiro veicoli', link:'/gestionale/azienda-ritiro-veicoli', linkActive:'azienda-ritiro-veicoli', icon: ICON12, label:'Azienda Ritiro Veicoli', attivo:true, level:['admin', 'superadmin']},
    {name:'ritiri-demolizioni', link:'/gestionale/ritiri-demolizioni', linkActive:'ritiri-demolizioni', icon: ICON3, label:'Ritiri Demolizioni', attivo:true, level:['admin', 'superadmin', 'company']},
    {name:'gestione-trasporto', link:'/gestionale/gestione-trasporto', linkActive:'gestione-trasporto', icon: ICON2, label:'Gestione Trasporto', attivo:true, level:['admin', 'superadmin']},
    {name:'trasporto-veicoli', link:'/gestionale/trasporto-veicoli', linkActive:'trasporto-veicoli', icon: ICON13, label:'Trasporto Veicoli', attivo:true, level:['transporter','admin','superadmin']},
    {name:'demolizioni', link:'/gestionale/certificati-demolizione', linkActive:'demolizioni', icon: ICON4, label:'Certificati Demolizione', attivo:true, level:['admin', 'superadmin', 'company']},
    {name:'veicoli', link:'/gestionale/modelli-veicoli', linkActive:'modelli-veicoli', icon: ICON6, label:'Veicoli', attivo:true, level:['admin', 'superadmin']},
    {name:'utenti', link:'/gestionale/update-utenti', linkActive:'update-utenti', icon: ICON11, label:'Utenti', attivo:false, level:['superadmin']},
  ]

// MODULI INFO 

export const moduliInfo = [
    {name:'Info', link:'/gestionale/info', linkActive:'info', icon: ICON1, label:'Info', attivo:'true'},
    {name:'Aiuto', link:'/gestionale/aiuto', linkActive:'aiuto', icon: ICON2, label:'Aiuto', attivo:'true'},
    {name:'Test', link:'/gestionale/test', linkActive:'test', icon: ICON3, label:'Test', attivo:'true'},
    {name:'Account', link:'/admin/account', linkActive:'account', icon: ICON4, label:'Account', attivo:'true'},
  ]

