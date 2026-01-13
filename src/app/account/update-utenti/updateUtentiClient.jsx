'use client'

import { useAdmin } from '@/app/admin/components/AdminContext'
import UpdateUser from './updateUser'

export default function UpdateUtentiClient({ users }) {
  const { utente, azienda, checking } = useAdmin() || {}

  if (checking) {
    return <p className="text-sm text-muted-foreground">Verifica permessi…</p>
  }

  const ruoloCorrente = utente?.user_metadata?.ruolo || utente?.ruolo

  // opzionale: blocco accesso se non admin/superadmin
  if (ruoloCorrente !== 'superadmin') {
    return <p className="text-sm text-red-500">Non sei autorizzato a gestire gli utenti.</p>
  }

  if (!users?.length) {
    return <p className="text-sm text-muted-foreground">Nessun utente trovato.</p>
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UpdateUser key={user.id} user={user} />
      ))}
    </div>
  )
}
