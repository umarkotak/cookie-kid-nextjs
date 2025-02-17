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

const roboto = Geist({
  weight: '400',
  subsets: ['latin'],
})

export default function App({ Component, pageProps }) {
  const pathName = usePathname()

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>Cookie Kid</title>
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

    if (pathName.startsWith("/watch")) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [pathName])

  return(
    <main className={`${!isMobile ? open ? "w-[calc(100%-13rem)]": "w-[calc(100%-3rem)]" : "w-full"}`}>
      <header className="sticky top-0 flex justify-between h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 backdrop-blur-md z-50 bg-inherit border-b border-primary">
        <div className="px-2">
          <SidebarTrigger />
        </div>
        <div className="px-2 flex gap-1">
          <a href="https://trakteer.id/marumaru">
            <Button size="sm" variant="outline">bantu cookie kid</Button>
          </a>
          <ChangeThemeButton />
        </div>
      </header>

      <div className="py-2 px-0 sm:px-2 w-full">
        {children}
      </div>
    </main>
  )
}
