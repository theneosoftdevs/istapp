import { NavLink } from "react-router-dom"
import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AppSidebarProps {
  mode: "desktop" | "tablet"
}

export function AppSidebar({ mode }: AppSidebarProps) {
  const { nav, portal } = useApp()
  const isRail = mode === "tablet"

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        isRail ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", isRail ? "justify-center" : "gap-2.5")}>
        <img src="/ista.jpeg" alt="Logo ISTA" className="size-9 shrink-0 rounded-lg object-cover" />
        {!isRail && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">ISTA-Goma</p>
            <p className="truncate text-xs text-muted-foreground">
              {portal?.label ?? "Portail"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <TooltipProvider delayDuration={0}>
          {nav.map((item) => {
            const link = (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isRail ? "justify-center" : "gap-3",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )
                }
              >
                <item.icon className="size-5 shrink-0" />
                {!isRail && <span className="truncate">{item.label}</span>}
              </NavLink>
            )

            if (isRail) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    {link}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return link
          })}
        </TooltipProvider>
      </nav>

      {!isRail && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            ISTA-Goma · 2024
          </p>
        </div>
      )}
    </aside>
  )
}
