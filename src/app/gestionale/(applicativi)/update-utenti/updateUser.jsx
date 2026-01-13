// src/app/gestionale/(applicativi)/update-utenti/updateUser.jsx
'use client'

import { useState, useTransition } from 'react'
import { updateUserMetadataById } from './updateUserMetadataById'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function UpdateUser({ user }) {
    
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name ?? '')
  const [ruolo, setRuolo] = useState(user.user_metadata?.ruolo ?? '')
  const [telefono, setTelefono] = useState(user.user_metadata?.telefono ?? '')

  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData) {
    startTransition(async () => {
      try {
        const res = await updateUserMetadataById(formData)
        toast.success(`Utente aggiornato: ${res.user?.email ?? ''}`)
      } catch (err) {
        console.error(err)
        toast.error(err.message ?? 'Errore aggiornamento utente')
      }
    })
  }

  return (
    <form
      action={handleSubmit}
      className="grid gap-3 p-3 border rounded-lg bg-background md:grid-cols-4 items-end"
    >
      <input type="hidden" name="userId" value={user.id} />

      <div className="space-y-1 md:col-span-1">
        <Label>Email</Label>
        <p className="text-sm text-muted-foreground break-all">{user.email}</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`displayName-${user.id}`}>Display Name</Label>
        <Input
          id={`displayName-${user.id}`}
          name="displayName"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Es: Mario Rossi"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`ruolo-${user.id}`}>Ruolo</Label>
        <Input
          id={`ruolo-${user.id}`}
          name="ruolo"
          value={ruolo}
          onChange={e => setRuolo(e.target.value)}
          placeholder="admin / company / superadmin"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`telefono-${user.id}`}>Telefono</Label>
        <Input
          id={`telefono-${user.id}`}
          name="telefono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="+39..."
        />
      </div>

      <div className="md:col-span-4 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvataggio…' : 'Salva'}
        </Button>
      </div>
    </form>
  )
}
