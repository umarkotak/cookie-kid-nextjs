import "@/styles/globals.css"

import { ThemeProvider } from "@/components/layouts/ThemeProvider"
import { CookiesProvider } from "react-cookie"
import Head from "next/head"
import { Geist } from 'next/font/google'
import { ToastContainer } from "react-toastify"
import { useCronitor } from '@cronitorio/cronitor-rum-nextjs'
import AppLayout from "@/components/layouts/app-layout"
import { SidebarProvider } from "@/components/ui/sidebar"

const roboto = Geist({
  weight: '400',
  subsets: ['latin'],
})

export default function App({ Component, pageProps }) {
  useCronitor('3f97b0a02f683b7af499e046f0495786')

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Ca Bocil</title>
      </Head>

      <CookiesProvider defaultSetOptions={{ path: '/' }} />

      <ToastContainer />

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <SidebarProvider
          className={roboto.className}
          defaultOpen={false}
        >
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </SidebarProvider>
      </ThemeProvider>
    </>
  )
}
