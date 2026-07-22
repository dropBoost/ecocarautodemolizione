import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CaricaFotoVeicolo from "./inserimentoFotoVeicolo"
import { MdAddAPhoto } from "react-icons/md";


export function DialogInserimentoFoto({uuidVeicoloRitirato, targa, setUpdateFoto}) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" className="text-xs bg-brand text-neutral-900"><MdAddAPhoto /></Button>
        </DialogTrigger>
        <DialogContent className="">
            <DialogTitle>Foto del veicolo</DialogTitle>
            <DialogDescription>Carica una o più foto del veicolo ritirato.</DialogDescription>
            <CaricaFotoVeicolo
              uuidVeicoloRitirato={uuidVeicoloRitirato}
              targa={targa}
              setUpdateFoto={setUpdateFoto}
              onSuccess={(dati) => {
                console.log("Foto salvate:", dati);
              }}
            />
        </DialogContent>
      </form>
    </Dialog>
  )
}
