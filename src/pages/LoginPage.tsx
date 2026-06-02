// src/pages/LoginPage.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Moon, Sun, ArrowRight, Mail, Lock, Loader2, ChevronLeft } from "lucide-react"
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
    setTimeout(() => {
      login(selectedRole)
      setIsLoading(false)
      navigate("/", { replace: true })
      toast.success("Connexion réussie")
    }, 800)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Veuillez entrer votre adresse email")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowForgot(false)
      toast.success("Un email de réinitialisation a été envoyé")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Shared Header */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/ista.jpeg" alt="ISTA Logo" className="size-9 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-tighter text-foreground leading-none">ISTA PORTAL</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Management</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl">
          {!selectedRole && !showForgot && (
            <div className="space-y-12">
              <div className="mx-auto max-w-2xl text-center space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl uppercase italic">
                  Bienvenue
                </h1>
                <p className="text-lg font-medium text-muted-foreground">
                  Sélectionnez votre espace pour accéder à vos services académiques.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary outline-none cursor-pointer"
                  >
                    <div className={cn("absolute inset-y-0 left-0 w-1 bg-muted group-hover:bg-primary transition-colors", portal.color.replace("text-", "bg-"))} />
                    <CardHeader className="pb-4">
                      <div className={cn("mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/50 transition-colors group-hover:bg-primary/10", portal.color)}>
                        <portal.icon className="size-6" />
                      </div>
                      <CardTitle className="text-xl font-bold">{portal.label}</CardTitle>
                      <CardDescription className="line-clamp-2 leading-relaxed">
                        {portal.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Accéder au portail
                        <ArrowRight className="size-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(selectedRole || showForgot) && (
            <div className="mx-auto w-full max-w-md animate-in fade-in zoom-in duration-300">
              <Card className="shadow-2xl border-primary/10">
                <CardHeader className="space-y-1 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(null)
                        setShowForgot(false)
                      }}
                      className="-ml-2 h-8 gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="size-4" />
                      Retour
                    </Button>
                    {selectedRole && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">
                        Portail {PORTALS.find(p => p.role === selectedRole)?.label}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                    {showForgot ? "Mot de passe oublié" : "Identification"}
                  </CardTitle>
                  <CardDescription>
                    {showForgot
                      ? "Un lien de récupération vous sera envoyé."
                      : "Entrez vos accès pour ouvrir votre session."}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={showForgot ? handleForgotPassword : handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold uppercase text-[10px] tracking-widest">Email académique</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="nom@ista-portal.cd"
                          className="pl-10 h-11 border-muted-foreground/20 bg-muted/10 focus:bg-background transition-colors"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    {!showForgot && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" title="Mot de passe" className="font-bold uppercase text-[10px] tracking-widest">Mot de passe</Label>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary"
                            type="button"
                            onClick={() => setShowForgot(true)}
                          >
                            Oublié ?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            className="pl-10 h-11 border-muted-foreground/20 bg-muted/10 focus:bg-background transition-colors"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 pt-2">
                    <Button className="w-full h-11 font-bold uppercase tracking-widest shadow-lg shadow-primary/20" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : (showForgot ? "Réinitialiser" : "Connexion")}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          © 2024 ISTA PORTAL · System
        </p>
      </footer>
    </div>
  )
}
