import { supabaseAdmin } from '@/lib/supabaseAdminClient'
import UpdateUtentiClient from './updateUtentiClient'

export default async function AccountPage() {

  const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  })

  if (listError) {
    console.error(listError)
    throw new Error('Errore nel caricamento utenti')
  }

  const users = data?.users ?? []

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Gestione utenti</h1>
      <UpdateUtentiClient users={users} />
    </div>
  )
}
