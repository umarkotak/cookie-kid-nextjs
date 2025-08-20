import { Book, Bot, Calendar, ChevronDown, GraduationCap, Home, ImageIcon, Inbox, Joystick, LayoutDashboard, Pencil, PlayIcon, Search, Settings, Slack, SlackIcon, Tv, TvIcon, UserCheck } from "lucide-react"
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

const items = [
  { key: "item-home", title: "Home", url: "/home", icon: Home },
  { key: "item-tv", title: "Tv", url: "/tv", icon: Tv },
  { key: "item-channel", title: "Channel", url: "/channels", icon: UserCheck },
  { key: "item-book", title: "Book", url: "/books", icon: Book },
  { key: "item-workbook", title: "Workbook", url: "/workbooks", icon: Pencil },
  { key: "item-sahabatai", title: "Sahabat AI", url: "/sahabat_ai", icon: Bot },
  { key: "item-game", title: "Game", url: "/games", icon: Joystick },
]

const adminItems = [
  { key: "admin-item-1", title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { key: "admin-item-2", title: "Channels", url: "/admin/channels", icon: TvIcon },
  { key: "admin-item-3", title: "Videos", url: "/admin/videos", icon: PlayIcon },
  { key: "admin-item-4", title: "Books", url: "/admin/books", icon: Book },
  { key: "admin-item-5", title: "ComfyUI Gallery", url: "/admin/comfy_ui/gallery", icon: ImageIcon },
]

export function DefaultSidebar() {
  const pathName = usePathname()
  const [isAdminPath, setIsAdminPath] = useState(false)

  useEffect(() => {
    if (!pathName) { return }
    setIsAdminPath(pathName.startsWith("/admin"))
  }, [pathName])

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
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
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
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
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>}
        </SidebarContent>

        <DefaultSidebarFooter />
      </Sidebar>
    </>
  )
}
