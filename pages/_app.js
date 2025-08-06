import "@/styles/globals.css"

import { ThemeProvider } from "@/components/layouts/ThemeProvider"
import { CookiesProvider } from "react-cookie"
import Head from "next/head"
import { usePathname } from "next/navigation"
import { DefaultSidebar } from "@/components/layouts/DefaultSidebar"
import { Geist, Roboto } from 'next/font/google'
import { ToastContainer } from "react-toastify"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useEffect } from "react"
import { ChangeThemeButton } from "@/components/utils/ChangeThemeButton"
import { Button } from "@/components/ui/button"
import { useCronitor } from '@cronitorio/cronitor-rum-nextjs'

const roboto = Geist({
  weight: '400',
  subsets: ['latin'],
})

export default function App({ Component, pageProps }) {
  const pathName = usePathname()
  useCronitor('3f97b0a02f683b7af499e046f0495786')

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>CaBocil</title>
      </Head>

      <CookiesProvider defaultSetOptions={{ path: '/' }} />

      <ToastContainer />

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <SidebarProvider className={roboto.className}>
          <DefaultSidebar />

          <Main>
            <Component {...pageProps} />
          </Main>
        </SidebarProvider>
      </ThemeProvider>
    </>
  )
}

function Main({ children }) {
  const pathName = usePathname()
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  useEffect(() => {
    if (!pathName) { return }

    if (pathName.startsWith("/watch") ||
        pathName.startsWith("/games/flowchart") ||
        pathName.includes("/read")) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [pathName])

  return(
    <main className={`${!isMobile ? open ? "w-[calc(100%-15rem)]": "w-[calc(100%-3rem)]" : "w-full"}`}>
      <header className="sticky top-0 flex justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 z-40 bg-background pt-3 pb-2 px-3">
        <div>
          <SidebarTrigger />
        </div>
        <div className="flex gap-1">
          <a href="https://trakteer.id/marumaru">
            <Button size="smv2" variant="outline">bantu cabocil</Button>
          </a>
          <ChangeThemeButton />
        </div>
      </header>

      <div className="py-2 px-2 sm:px-3 w-full">
        {children}
      </div>
    </main>
  )
}
