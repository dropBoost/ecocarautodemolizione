import { Footer, Header } from '@/app/componenti-sito/theme'

export const metadata = {
  title: `ECOCAR AUTODEMOLIZIONE`,
  description: "powered by DROPBOOST.it",
};

export default function LayoutSito({ children }) {
  return (
    <div
      className="
        flex flex-col h-dvh min-h-0 overflow-hidden supports-[height:100svh]:h-[100svh]
        bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100
      "
    >
      {/* Header */}
      <Header />

      {/* Main scrollabile */}
      <main className="bg-neutral-100 dark:bg-neutral-900 flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain scrollbar-sito">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}