import { Book, Bot, Calendar, ChevronDown, GraduationCap, HandCoins, Home, ImageIcon, Inbox, Joystick, LayoutDashboard, Pencil, PlayIcon, ReceiptText, Search, Settings, Slack, SlackIcon, Tv, TvIcon, UserCheck } from "lucide-react"
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SIDEBAR_WIDTH,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import { DefaultSidebarFooter, SidebarUser } from "./DefaultSidebarFooter"
import { ChangeThemeButton } from "../utils/ChangeThemeButton"
import { usePathname } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { useState, useEffect } from "react"
import Link from "next/link"
import ytkiddAPI from "@/apis/ytkidApi"
import { toast } from "react-toastify"
import { useRouter } from "next/router"

const items = [
  { key: "item-home", title: "Home", url: "/home", icon: Home },
  { key: "item-tv", title: "Tv", url: "/tv", icon: Tv },
  { key: "item-channel", title: "Channel", url: "/channels", icon: UserCheck },
  { key: "item-book", title: "Book", url: "/books", icon: Book },
  { key: "item-workbook", title: "Workbook", url: "/workbooks", icon: Pencil },
  { key: "item-subscription", title: "Subscription", url: "/subscription", icon: ReceiptText },
  // { key: "item-sahabatai", title: "Sahabat AI", url: "/sahabat_ai", icon: Bot },
  { key: "item-game", title: "Game", url: "/games", icon: Joystick },
  { key: "item-support", title: "Support Ca Bocil", url: "https://trakteer.id/marumaru", icon: HandCoins },
]

const adminItems = [
  { key: "admin-item-1", title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { key: "admin-item-2", title: "Channels", url: "/admin/channels", icon: TvIcon },
  { key: "admin-item-4", title: "Books", url: "/admin/books", icon: Book },
  { key: "admin-item-5", title: "ComfyUI Gallery", url: "/admin/comfy_ui/gallery", icon: ImageIcon },
]

export function DefaultSidebar() {
  const pathName = usePathname()
  const [isAdminPath, setIsAdminPath] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!pathName) { return }
    setIsAdminPath(pathName.startsWith("/admin"))
  }, [pathName])

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
        Logout()
        // toast.error(`error ${JSON.stringify(body)}`)
        return
      }

      // console.warn("USER DATA", body.data)

      setUserData(body.data.user)

      if (pathName && pathName.startsWith("/admin")) {
        if (!["admin", "superadmin"].includes(body.data.user.user_role)) {
          router.replace("/home")
        }
      }

    } catch (e) {
      // Logout()
      toast.error(`error ${e}`)
    }
  }

  function Logout() {
    ytkiddAPI.removeCookie("CK:AT")

    toast.success("Logout Successfull")

    router.reload()
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-none"
    >
      <SidebarHeader>
        <SidebarMenu>
          <a href="/">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/images/cookie_kid_logo_circle.png" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    CaBocil
                  </span>
                  <span className="truncate text-xs">aplikasi untuk anak</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </a>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Menu
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={`${pathName}`.startsWith(item.url)}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {isAdminPath && <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Admin
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={`${pathName}` === item.url}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>}
      </SidebarContent>

      <DefaultSidebarFooter userData={userData} />
    </Sidebar>
  )
}
