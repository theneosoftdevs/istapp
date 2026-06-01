// src/components/SettingsDialog.tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API update
    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      toast.success("Paramètres mis à jour avec succès")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paramètres du profil</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles ici.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="settings-email">Adresse e-mail</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-phone">Numéro de téléphone</Label>
            <Input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+243..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-password">Nouveau mot de passe</Label>
            <Input
              id="settings-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laissez vide pour ne pas changer"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
