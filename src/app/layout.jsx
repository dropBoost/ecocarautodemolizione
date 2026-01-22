import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HI DEM",
  description: "powered by DROPBOOST.it",
};

export default async function RootLayout({ children }) {


  return (
    <html lang="it" suppressHydrationWarning className="h-full min-h-0 ">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground overflow-x-hidden`}>
        <Analytics/>
        <ThemeProvider attribute='class' enableSystem defaultTheme='system'>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                title: "!text-white",
                description: "!text-neutral-950",
                actionButton: "!bg-brand text-black",
                cancelButton: "!bg-red-500 !text-white",
                success: "!bg-brand !text-neutral-950 !border-brand/50",
                error: "!bg-red-600 !text-white !border-red-700",
                warning: "!bg-red-400 !text-black !border-red-600",
                info: "!bg-sky-600 !text-white !border-sky-700",
              },
            }}
          />
        </ThemeProvider>  
      </body>
    </html>
  );
}