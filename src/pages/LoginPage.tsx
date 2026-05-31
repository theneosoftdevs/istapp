// src/pages/LoginPage.tsx
import { useNavigate } from "react-router-dom"
import { GraduationCap, Moon, Sun, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useApp } from "@/contexts/AppContext"
import { PORTALS } from "@/lib/portals"
import type { Role } from "@/types"

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useApp()
  const navigate = useNavigate()

  const handleSelect = (role: Role) => {
    login(role)
    navigate("/", { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">ISTA-Goma</p>
            <p className="text-xs text-muted-foreground">Gestion Universitaire</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Basculer le thème">
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Bienvenue sur ISTA-Goma PWA
            </h1>
            <p className="text-pretty text-muted-foreground">
              Sélectionnez votre portail pour accéder à votre espace de travail.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTALS.map((portal) => (
              <Card
                key={portal.role}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(portal.role)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleSelect(portal.role)
                  }
                }}
                className="group cursor-pointer p-5 transition-colors hover:border-primary/60 hover:bg-accent/40 focus-visible:border-primary focus-visible:outline-none"
              >
                <div className="flex h-full flex-col gap-4">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-lg bg-muted",
                      portal.color,
                    )}
                  >
                    <portal.icon className="size-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h2 className="font-semibold text-foreground">{portal.label}</h2>
                    <p className="text-sm text-muted-foreground">{portal.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    Se connecter
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Démonstration — connexion simulée sans mot de passe. Le rôle est enregistré localement.
          </p>
        </div>
      </main>
    </div>
  )
}
