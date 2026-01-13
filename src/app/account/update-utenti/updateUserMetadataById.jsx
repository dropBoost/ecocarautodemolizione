// src/app/gestionale/(applicativi)/update-utenti/updateUserMetadataById.js
'use server'

import { supabaseAdmin } from '@/lib/supabaseAdminClient'

export async function updateUserMetadataById(formData) {
  const userId = formData.get('userId')
  const displayName = formData.get('displayName')
  const ruolo = formData.get('ruolo')
  const telefono = formData.get('telefono')

  if (!userId) {
    throw new Error('userId mancante')
  }

  // Aggiorno direttamente l'utente tramite Admin API
  const { data, error: updateError } =
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        display_name: displayName ?? undefined,
        ruolo: ruolo ?? undefined,
        telefono: telefono ?? undefined,
        // qui puoi aggiungere altre chiavi se vuoi:
        // uuid_rules: '...',
      },
    })

  if (updateError) {
    console.error(updateError)
    throw new Error(`Errore aggiornamento utente: ${updateError.message}`)
  }

  return data
}
