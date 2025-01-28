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
import { SidebarUser } from "./SidebarUser"
import { ChangeThemeButton } from "../utils/ChangeThemeButton"
import { usePathname } from "next/navigation"

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Channel", url: "/channels", icon: UserCheck },
  { title: "Book", url: "/books", icon: Book },
  { title: "Workbook", url: "/workbooks", icon: Pencil },
  { title: "Sahabat AI", url: "/sahabat_ai", icon: Bot },
  { title: "Game", url: "/games", icon: Joystick },
  { title: "Setting", url: "/setting", icon: Settings },
]

export function DefaultLayout({ children }) {
  return (
    <>
      <SidebarProvider>
        <Sidebar
          collapsible="icon"
          variant="sidebar"
        >
          <SidebarHeader>
            <SidebarMenu>
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
                    <span className="truncate text-xs">help you learn</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
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

          <SidebarFooter>
            <SidebarUser user={{
              avatar: "https://placehold.co/300",
              name: "m umar r",
              email: "codingmase@gmail.com",
            }} />
          </SidebarFooter>
        </Sidebar>

        <SidebarMain children={children} />
      </SidebarProvider>
    </>
  )
}

function SidebarMain({ children }) {
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

  React.useEffect(() => {
    if (pathName.startsWith("/watch")) {
      setOpen(false)
      return
    }

    setOpen(true)
  }, [pathName])

  return(
    <div className={`${!isMobile ? open ? "w-[calc(100%-13rem)]": "w-[calc(100%-3rem)]" : "w-full"}`}>
      {/* <header className="sticky top-0 flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 backdrop-blur-md z-50 bg-inherit"> */}
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
    </div>
  )
}
