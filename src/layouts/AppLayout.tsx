// src/layouts/AppLayout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Moon, Sun, LogOut, User as UserIcon, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/layouts/AppSidebar"
import { MobileNavbar } from "@/layouts/MobileNavbar"
import { useApp } from "@/contexts/AppContext"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigation } from "@/hooks/use-navigation"
import { cn } from "@/lib/utils"
import { SettingsDialog } from "@/components/SettingsDialog"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function initials(firstName: string, lastName: string) {
  return (firstName[0] || "") + (lastName[0] || "")
}

export function AppLayout() {
  const { theme, toggleTheme, portal } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navMode = useNavigation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const userName = user ? `${user.firstName} ${user.lastName}` : ""

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Tablet & Desktop */}
      {(navMode === "desktop" || navMode === "tablet") && (
        <AppSidebar mode={navMode} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          {/* Logo only on mobile in header */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80 sm:hidden">
            <img src="/ista.jpeg" alt="Logo ISTA" className="size-8 shrink-0 rounded-sm object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-tighter">
                ISTA PORTAL
              </p>
            </div>
          </Link>

          {/* Title on desktop (no logo here because it's in sidebar) */}
          <div className="hidden items-center gap-2 sm:flex">
            <h2 className="text-lg font-black tracking-tighter text-foreground uppercase italic">ISTA PORTAL</h2>
            <div className="h-4 w-px bg-border mx-1" />
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {portal?.label}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link to="/communications" aria-label="Annonces et Communiqués">
                      <div className="relative">
                        <Bell className="size-5" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-destructive" />
                      </div>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Annonces
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
                  >
                    {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Mode {theme === "dark" ? "Clair" : "Sombre"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Menu utilisateur"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-black text-primary uppercase">
                      {user ? initials(user.firstName, user.lastName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-bold text-foreground sm:inline uppercase tracking-tight">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-bold uppercase text-xs">{userName}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="size-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={cn(
          "flex-1 px-4 py-6 sm:px-6 lg:px-8",
          navMode === "mobile" ? "pb-24" : "pb-12"
        )}>
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navbar for Mobile */}
      {navMode === "mobile" && <MobileNavbar />}

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
