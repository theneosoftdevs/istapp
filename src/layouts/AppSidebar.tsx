// src/layouts/AppSidebar.tsx
import { NavLink } from "react-router-dom"
import { GraduationCap, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/src/contexts/AppContext"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const { nav, portal, sidebarOpen, setSidebarOpen } = useApp()

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">ISTA-Goma</p>
          <p className="truncate text-xs text-muted-foreground">
            {portal?.label ?? "Portail"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X className="size-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">
          ISTA-Goma · Système de Gestion Universitaire
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        {content}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border shadow-xl">
            {content}
          </div>
        </div>
      ) : null}
    </>
  )
}
