"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Detect if the device is iOS Safari
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod|safari/.test(userAgent)
    }

    const isInStandaloneMode = () =>
      // @ts-ignore
      ("standalone" in window.navigator) && // iOS standalone mode
      // @ts-ignore
      window.navigator.standalone

    // Show button for iOS Safari if not installed (standalone)
    if (isIos() && !isInStandaloneMode()) {
      setCanInstall(true)
    }

    // For other browsers: listen to beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const onClick = async () => {
    // Detect iOS Safari again on click
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod|safari/.test(userAgent)
    }

    if (isIos()) {
      // Redirect to /install tutorial page for Safari iOS
      router.push("/install")
      return
    }

    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    }
    setDeferredPrompt(null)
    setCanInstall(false)
  }

  if (!canInstall) {
    return null
  }

  return (
    <Button size="smv2" variant="outline" onClick={onClick}>
      Install App
    </Button>
  )
}
