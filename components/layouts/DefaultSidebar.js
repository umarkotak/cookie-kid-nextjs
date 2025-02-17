import * as React from "react"
import { Book, Bot, Calendar, GraduationCap, Home, Inbox, Joystick, Pencil, Search, Settings, Slack, SlackIcon, UserCheck } from "lucide-react"
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

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Channel", url: "/channels", icon: UserCheck },
  { title: "Book", url: "/books", icon: Book },
  { title: "Workbook", url: "/workbooks", icon: Pencil },
  { title: "Sahabat AI", url: "/sahabat_ai", icon: Bot },
  { title: "Game", url: "/games", icon: Joystick },
]

export function DefaultSidebar() {
  const pathName = usePathname()

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
                      Cookie Kid
                    </span>
                    <span className="truncate text-xs">curated content for kid</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </a>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathName.startsWith(item.url)}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <DefaultSidebarFooter />
      </Sidebar>
    </>
  )
}
