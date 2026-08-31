'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { AdminProvider } from '@/app/admin/components/AdminContext'

export default function LayoutGestionale({ children }) {

  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [utente, setUtente] = useState(null)
  const ruolo = utente?.user_metadata?.ruolo

  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        setChecking(false)
        return
      }

      if (!data.session) {
        router.push('/admin/login')
      } else {
        setUtente(data.session.user)
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neutral-900">
        <p className="text-neutral-100">Verifica autenticazione...</p>
      </div>
    )
  }

  return (
    <AdminProvider>
      {ruolo !== "" ? (
        <div className="min-h-dvh scrollbar-gestionale">
          <div className="flex min-h-0 flex-col overflow-hidden">
            <main className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      ) : (
        "non autorizzato"
      )}
    </AdminProvider>
  )
}
