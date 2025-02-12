import "@/styles/globals.css"

import { ThemeProvider } from "@/components/layouts/ThemeProvider"
import { CookiesProvider } from "react-cookie"
import Head from "next/head"
import { usePathname } from "next/navigation"
import { DefaultLayout } from "@/components/layouts/DefaultLayout"
import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Geist, Roboto } from 'next/font/google'
import { StudentLayout } from "@/components/layouts/StudentLayout"
import { ToastContainer } from "react-toastify"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import Sidebar from "@/components/Sidebar"
import { useEffect } from "react"
import { ChangeThemeButton } from "@/components/utils/ChangeThemeButton"

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
      </Head>
      <CookiesProvider defaultSetOptions={{ path: '/' }} />
      <ToastContainer />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <Head>
          <title>Cookie Kid</title>
        </Head>

        <SidebarProvider className={roboto.className}>
          {pathName && !pathName.startsWith("/student") && !pathName.startsWith("/admin") && <DefaultLayout />}

          {/* {pathName && pathName.startsWith("/student") && <StudentLayout>
            <Component {...pageProps} />
          </StudentLayout>}

          {pathName && pathName.startsWith("/admin") && <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>} */}

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
    if (pathName.startsWith("/watch")) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [pathName])

  return(
    <main className={`${!isMobile ? open ? "w-[calc(100%-13rem)]": "w-[calc(100%-3rem)]" : "w-full"}`}>
      <header className="flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 backdrop-blur-md z-50 bg-inherit">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex justify-end items-center gap-2 px-4">
          <ChangeThemeButton />
        </div>
      </header>

      <div className="p-4 pt-0 w-full">
        {children}
      </div>
    </main>
  )
}
