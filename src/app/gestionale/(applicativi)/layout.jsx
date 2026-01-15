'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { companyName, moduliGestionale, version } from '../../cosetting'
import { useAdmin } from '@/app/admin/components/AdminContext'
import { HomeButton, ThemeToggle, LogoutButton, PlusButton } from '@/app/componenti/button'

export default function LayoutGestionale({ children }) {

  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const utente = useAdmin()?.utente
  const ruolo = utente?.user_metadata.ruolo
  const [openUpBar, setOpenUpBar] = useState(false)

  return (
    <div className="
      grid h-dvh min-h-0 overflow-hidden supports-[height:100svh]:h-[100svh]
      grid-cols-1 grid-rows-[64px_1fr_48px]
      md:grid-cols-[280px_1fr]
      bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100
    ">
      {/* Sidebar desktop */}
      <aside className="hidden md:block md:row-span-3 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <Sidebar pathname={pathname} u={utente} rule={ruolo}/>
      </aside>

      {/* Drawer mobile */}
      <MobileDrawer open={open} onClose={() => setOpen(false)}>
        <Sidebar pathname={pathname} u={utente} rule={ruolo} onNavigate={() => setOpen(false)} />
      </MobileDrawer>

      {/* Header */}
      <header className="col-start-1 md:col-start-2 row-start-1 flex items-center justify-between gap-3 px-3 md:px-4 bg-brand backdrop-blur">
        <div id='headerCNT' className={`${!openUpBar ? "flex items-center justify-between flex-row w-full" : "hidden"}`}>
          <div className="flex items-center gap-2">
            <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-900" onClick={() => setOpen(true)} aria-label="Apri menu">
              {/* Icona hamburger */}
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="font-medium uppercase">Backoffice Demolizioni</span>
          </div>
          <div className="flex items-center gap-2">
            <PlusButton open={() => setOpenUpBar(prev => !prev)} stato={openUpBar}/>
            <HomeButton/>
            <LogoutButton/>
          </div>
        </div>
        <div id='headerCNT' className={`${openUpBar ? "flex items-center justify-between flex-row w-full" : "hidden"}`}>
          <div className="flex items-center gap-2">
            <span className="font-medium uppercase">Backoffice Demolizioni</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle/>
            <PlusButton open={() => setOpenUpBar(prev => !prev)} stato={openUpBar}/>
          </div>
        </div>
      </header>

      {/* Main scrollabile */}
      <main className="bg-white dark:bg-neutral-900 col-start-1 md:col-start-2 row-start-2 min-w-0 min-h-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        <div className="lg:p-5 p-3">
          {children}
        </div>
      </main>

      {/* Footer */}
      
      <footer className="
        col-start-1 md:col-start-2 row-start-3
        flex items-center justify-between px-3 md:px-4 text-sm
        border-t border-neutral-200 dark:border-neutral-800
        dark:bg-neutral-900 bg-white
      ">
        <span>© {new Date().getFullYear()} – {companyName}</span>
        <span className="text-neutral-500">v{version}</span>
      </footer>
    </div>
  )
}

function Sidebar({ pathname, onNavigate, u, rule }) {
  return (
    <nav className="flex h-full flex-col">
      <div className="h-[64px] flex items-center px-4 bg-brand">
        <span className="font-semibold">Gestione</span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 bg-neutral-100 dark:bg-neutral-900 border-r">
        <ul className="space-y-1 px-2">
          {rule !== "superadmin" ?
          <>
          {moduliGestionale
          .filter((r) => r.attivo === true)
          .filter((r) => r.level?.includes(rule))
          .map((item, index) => {
            const active =
              pathname === item.link ||
              (item.link !== '/gestionale' && pathname?.startsWith(item.link))

            return (
              <li key={index}>
                <Link
                  href={item.link}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                    ${active
                      ? 'bg-brand/60 text-neutral-100 dark:bg-brand/40 dark:text-neutral-100'
                      : 'text-neutral-700 hover:text-neutral-50 hover:bg-brand dark:text-neutral-500 dark:hover:text-neutral-900 dark:hover:bg-brand'
                    }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
          </> :
          <>
          {moduliGestionale
          .filter((r) => r.level?.includes(rule))
          .map((item, index) => {
            const active =
              pathname === item.link ||
              (item.link !== '/gestionale' && pathname?.startsWith(item.link))

            return (
              <li key={index}>
                <Link
                  href={item.link}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition
                    ${active
                      ? 'bg-brand/60 text-neutral-100 dark:bg-brand/40 dark:text-neutral-100'
                      : 'text-neutral-700 hover:text-neutral-50 hover:bg-brand dark:text-neutral-500 dark:hover:text-neutral-900 dark:hover:bg-brand'
                    }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
          </>}
        </ul>
      </div>

      <div className="h-[48px] border-t border-neutral-200 dark:border-neutral-800 px-3 flex items-center text-xs text-neutral-500">
          {u?.email}
      </div>
    </nav>
  )
}

function MobileDrawer({ open, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />
      {/* Pannello */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px]
          bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 md:hidden
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {children}
      </div>
    </>
  )
}
