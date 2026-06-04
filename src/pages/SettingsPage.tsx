// src/pages/SettingsPage.tsx
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/PageHeader"
import locales from "@/lib/locales.json"

export function SettingsPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API update
    setTimeout(() => {
      setIsLoading(false)
      toast.success(locales.common.success_update)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locales.settings.settings_title}
        subtitle={locales.settings.profile_desc}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{locales.settings.profile_settings}</CardTitle>
          <CardDescription>
            {locales.settings.profile_desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-email">{locales.settings.email_label}</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-phone">{locales.settings.phone_label}</Label>
                <Input
                  id="settings-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-password">{locales.settings.new_password_label}</Label>
              <div className="relative max-w-sm">
                <Input
                  id="settings-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={locales.settings.password_placeholder}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? locales.common.hide_password : locales.common.show_password}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {locales.settings.save_changes}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
