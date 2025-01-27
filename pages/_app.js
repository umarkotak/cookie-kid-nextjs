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
      <CookiesProvider defaultSetOptions={{ path: '/' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Head>
            <title>Cookie Kid</title>
          </Head>

          <main className={roboto.className}>
            {!pathName.startsWith("/student") && !pathName.startsWith("/admin") && <DefaultLayout>
              <Component {...pageProps} />
            </DefaultLayout>}

            {pathName.startsWith("/student") && <StudentLayout>
              <Component {...pageProps} />
            </StudentLayout>}

            {pathName.startsWith("/admin") && <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>}
          </main>

          <ToastContainer />
        </ThemeProvider>
      </CookiesProvider>
    </>
  )
}
