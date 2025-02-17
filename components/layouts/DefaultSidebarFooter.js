"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogInIcon,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ytkiddAPI from "@/apis/ytkidApi"
import { useRouter } from "next/router"
import { toast } from "react-toastify"

export function DefaultSidebarFooter() {
  const router = useRouter()
  const pathName = usePathname()
  const { isMobile } = useSidebar()
  const [userData, setUserData] = useState({})

  useEffect(() => {
    GetCheckAuth()
  }, [pathName])

  async function GetCheckAuth() {
    if (ytkiddAPI.GenAuthToken() === "") { return }

    try {
      const response = await ytkiddAPI.GetCheckAuth("", {}, {})
      const body = await response.json()

      if (response.status !== 200) {
        toast.error(`error ${JSON.stringify(body)}`)
        return
      }

      // console.warn("USER DATA", body.data)

      setUserData(body.data)

    } catch (e) {
      toast.error(`error ${e}`)
    }
  }

  function Logout() {
    localStorage.removeItem("CK:AT")

    toast.success("Logout Successfull")

    router.reload()
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <Link href="/setting"><SidebarMenuItem>
          <SidebarMenuButton>
            <Settings />
            Setting
          </SidebarMenuButton>
        </SidebarMenuItem></Link>
        { userData.guid
          ? <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userData.photo_url} alt={userData.name} />
                    <AvatarFallback className="rounded-lg"><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userData.name}</span>
                    <span className="truncate text-xs">{userData.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userData.photo_url} alt={userData.name} />
                      <AvatarFallback className="rounded-lg"><img src="/images/cookie_kid_logo_circle.png" /></AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userData.name}</span>
                      <span className="truncate text-xs">{userData.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {["admin", "superadmin"].includes(userData.user_role) && <Link href="/admin"><DropdownMenuItem><LayoutDashboard />Admin</DropdownMenuItem></Link>}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={()=>Logout()}><LogOut />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          : <Link href="/sign_in"><SidebarMenuItem>
            <SidebarMenuButton>
              <LogInIcon />
              Sign In
            </SidebarMenuButton>
          </SidebarMenuItem></Link>
        }
      </SidebarMenu>
    </SidebarFooter>
  )
}
