// src/pages/LoginPage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, Moon, Sun, ArrowRight, Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useApp } from "@/contexts/AppContext"
import { PORTALS } from "@/lib/portals"
import type { Role } from "@/types"
import { toast } from "sonner"

export function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useApp()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un portail")
      return
    }
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      login(selectedRole)
      setIsLoading(false)
      navigate("/", { replace: true })
      toast.success("Connexion réussie")
    }, 1000)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowForgot(false)
      toast.success("Un email de réinitialisation a été envoyé")
    }, 1000)
  }

  if (showForgot) {
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
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre adresse email pour recevoir un lien de réinitialisation.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="nom@ista-goma.cd"
                      className="pl-9"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Envoyer le lien
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowForgot(false)}>
                  Retour à la connexion
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    )
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

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-4xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Bienvenue sur ISTA-Goma PWA
            </h1>
            <p className="text-pretty text-muted-foreground">
              Connectez-vous à votre espace de travail.
            </p>
          </div>

          {!selectedRole ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
              {PORTALS.map((portal) => (
                <Card
                  key={portal.role}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRole(portal.role)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedRole(portal.role)
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
                      Choisir ce portail
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mx-auto w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedRole(null)} className="size-8">
                    <ArrowRight className="size-4 rotate-180" />
                  </Button>
                  Portail {PORTALS.find(p => p.role === selectedRole)?.label}
                </CardTitle>
                <CardDescription>
                  Veuillez entrer vos identifiants pour continuer.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nom@ista-goma.cd"
                        className="pl-9"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs"
                        type="button"
                        onClick={() => setShowForgot(true)}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-9"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Se connecter
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Démonstration — entrez n'importe quel email/mot de passe après avoir choisi un portail.
          </p>
        </div>
      </main>
    </div>
  )
}
