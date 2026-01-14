'use server'

import { supabaseAdmin } from '@/lib/supabaseAdminClient'
import { revalidatePath } from 'next/cache'

export async function updateUserMetadataById(formData) {
  const userId = formData.get('userId')
  const displayName = formData.get('displayName')
  const ruolo = formData.get('ruolo')
  const telefono = formData.get('telefono')

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      display_name: displayName || undefined,
      ruolo: ruolo || undefined,
      telefono: telefono || undefined,
    },
  })

  if (error) throw new Error(`Errore aggiornamento utente: ${error.message}`)

  // 🔥 fondamentale in produzione (cache App Router)
  revalidatePath('/gestionale/update-utenti')

  return data
}