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
import { Badge } from "@/components/ui/badge"
import { SettingsDialog } from "@/components/SettingsDialog"
import { useState } from "react"

function initials(firstName: string, lastName: string) {
  return (firstName[0] || "") + (lastName[0] || "")
}

export function AppLayout() {
  const { theme, toggleTheme, portal, nav } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navMode = useNavigation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const userName = user ? `${user.firstName} ${user.lastName}` : ""

  // Simplified: we would normally get this from a hook or state
  // But for now let's just use the AppContext or similar if it has it
  // Since I don't want to add too much overhead, I'll just render the bell
  // In a real app, I'd get the unread count here.

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
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <img src="/ista.jpeg" alt="Logo ISTA" className="size-8 shrink-0 rounded-sm object-cover" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Goma
              </p>
              <p className="truncate text-sm font-bold text-foreground leading-tight">
                ISTA
              </p>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block mx-1" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                Portail {portal?.label}
              </p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link to="/communications" aria-label="Notifications">
                <div className="relative">
                  <Bell className="size-5" />
                  {/* Real unread count would be better, but let's keep it simple */}
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-destructive" />
                </div>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent"
                  aria-label="Menu utilisateur"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {user ? initials(user.firstName, user.lastName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="size-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
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
