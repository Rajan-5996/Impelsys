import { Fragment } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"

import logo from "@/assets/logo.png"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

import { navGroups } from "@/constants/sidebar-nav"

const labelMotionProps = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.15, ease: "easeOut" as const },
}

function SidebarUserMenu({ isExpanded }: { isExpanded: boolean }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 outline-none hover:bg-sidebar-accent/20 group-data-[collapsible=icon]:justify-center">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-standard text-[11px] font-bold text-white shadow-sm">
          SM
        </span>
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.span
              key="user-text"
              {...labelMotionProps}
              className="flex min-w-0 flex-col overflow-hidden text-left leading-tight"
            >
              <span className="truncate text-[12px] font-semibold text-sidebar-foreground">
                Siva Ram Murugan
              </span>
              <span className="truncate text-[10.5px] text-sidebar-foreground/60">
                Data Governance Lead
              </span>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <UserIcon /> My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")}>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const isExpanded = state === "expanded"

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar": "var(--standard)",
          "--sidebar-foreground": "#ffffff",
          "--sidebar-accent": "var(--primary)",
          "--sidebar-accent-foreground": "#ffffff",
          "--sidebar-border": "rgba(0,0,0,0.15)",
          "--sidebar-ring": "var(--standard)",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-72 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1.4px)",
          backgroundSize: "10px 10px",
          maskImage: "linear-gradient(to top, black 0%, black 15%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 15%, transparent 95%)",
        }}
      />
      <SidebarHeader className="relative z-10 px-3 pt-4 pb-2 group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <img src={logo} alt="Logo" className="size-full object-contain" />
          </div>
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                key="header-text"
                {...labelMotionProps}
                className="flex min-w-0 flex-col overflow-hidden"
              >
                <span className="truncate text-[11px] leading-tight font-medium tracking-wide text-sidebar-foreground uppercase">
                  GWC Data Operations Platform
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        {navGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 ? <SidebarSeparator /> : null}
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] tracking-wider text-sidebar-foreground/60">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive =
                      item.path === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.path)

                    return (
                      <SidebarMenuItem key={item.title} className="relative">
                        {isActive ? (
                          <motion.span
                            layoutId="sidebar-active-indicator"
                            className="absolute inset-y-1.5 left-0 z-10 w-[3px] rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.55)]"
                            transition={{ type: "spring", stiffness: 500, damping: 40 }}
                          />
                        ) : null}
                        <SidebarMenuButton
                          render={<NavLink to={item.path} />}
                          isActive={isActive}
                          tooltip={{
                            children: item.title,
                            className: "bg-primary text-white",
                          }}
                          className={cn(
                            "gap-3 rounded-lg border border-transparent text-[13px] text-sidebar-foreground",
                            isActive && "border-sidebar-foreground/30 font-semibold"
                          )}
                        >
                          <item.icon className="size-4" />
                          <AnimatePresence initial={false}>
                            {isExpanded ? (
                              <motion.span
                                key="label"
                                {...labelMotionProps}
                                className="truncate"
                              >
                                {item.title}
                              </motion.span>
                            ) : null}
                          </AnimatePresence>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="relative z-10 border-t border-sidebar-border px-2 py-2">
        <SidebarUserMenu isExpanded={isExpanded} />
      </SidebarFooter>
    </Sidebar>
  )
}
