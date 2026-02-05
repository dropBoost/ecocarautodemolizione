// app/admin/AdminContext.jsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const AdminContext = createContext(null)

export function useAdmin() {
  return useContext(AdminContext)
}

export function AdminProvider({ children }) {
  const router = useRouter()
  const [utente, setUtente] = useState(null)
  const [azienda, setAzienda] = useState(null)
  const [checking, setChecking] = useState(true)

useEffect(() => {
  let alive = true;

  async function checkAuth() {
    const { data, error } = await supabase.auth.getSession();

    if (!alive) return;

    if (error) {
      console.error(error);
      setChecking(false);
      return;
    }

    if (!data.session) {
      setUtente(null);
      setChecking(false);
      router.push('/admin/login');
      return;
    }

    const user = data.session.user;
    const ruolo = user?.user_metadata?.ruolo;

    // ✅ ruoli ammessi
    const allowed = ['company', 'admin', 'superadmin', 'transporter'];

    if (!allowed.includes(ruolo)) {
      setUtente(null);
      setChecking(false);
      router.push('/admin/login');
      return;
    }

    // ✅ ok: non redirectare qui
    setUtente(user);
    setChecking(false);
  }

  checkAuth();

  return () => { alive = false; };
}, [router]);

  // DATI AZIENDA
  useEffect(() => {

    if (!utente?.id) return

    async function checkRules() {
      const { data, error } = await supabase
        .from('azienda_ritiro_veicoli')
        .select(`*, uuid_rules(*)`)
        .eq('uuid_azienda_ritiro_veicoli', utente.id)
        .maybeSingle()

      if (error) {
        console.error(error)
        toast.error('Errore nel caricamento Azienda Dati')
        return
      }

      setAzienda(data)

    }

    checkRules()

  }, [utente?.id, router])

  return (
    <AdminContext.Provider value={{ utente, azienda, checking }}>
      {children}
    </AdminContext.Provider>
  )
}
