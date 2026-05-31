import { useState } from "react"
import { Bell, Megaphone, CheckCheck, Star, AlertCircle, BookMarked } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnnouncementList } from "@/components/AnnouncementList"
import { Loader } from "@/components/ui/Loader"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import { markNotificationRead, markAllNotificationsRead } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Notification, Announcement } from "@/types"

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: any; label: string; color: string }
> = {
  grade_modified: {
    icon: Star,
    label: "Note modifiée",
    color: "bg-chart-2/10 text-chart-2",
  },
  new_appeal: {
    icon: AlertCircle,
    label: "Nouveau recours",
    color: "bg-warning/10 text-warning",
  },
  appeal_resolved: {
    icon: CheckCheck,
    label: "Recours traité",
    color: "bg-success/10 text-success",
  },
  course_assigned: {
    icon: BookMarked,
    label: "Cours attribué",
    color: "bg-chart-5/10 text-chart-5",
  },
}

function relativeDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

export function NotificationsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("announcements")

  const { data, loading } = usePageData((d) => {
    const announcements = d.announcements
      .filter((a) => a.audience === "all" || a.audience === user?.role)
      .sort((a, b) => b.date.localeCompare(a.date))
    
    const notifications = d.notifications
      .filter((n) => n.targetRole === user?.role)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return { announcements, notifications }
  })

  if (loading || !data) return <Loader fullHeight />

  const { announcements, notifications } = data
  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre de communications"
        subtitle="Retrouvez ici toutes les annonces officielles et vos notifications personnelles."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="announcements" className="gap-2">
            <Megaphone className="size-4" />
            Annonces
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0 text-[10px]">
              {announcements.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 py-0 text-[10px]">
                {unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <AnnouncementList items={announcements} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="size-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Aucune notification</p>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez reçu aucune notification pour le moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                {unreadNotifications > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => user?.role && markAllNotificationsRead(user.role)}
                  >
                    <CheckCheck className="size-4" />
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <div className="grid gap-2">
                {notifications.map((n) => {
                  const cfg = TYPE_CONFIG[n.type]
                  const NIcon = cfg.icon
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markNotificationRead(n.id)}
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/30",
                        !n.read && "border-primary/20 bg-primary/5",
                      )}
                    >
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", cfg.color)}>
                        <NIcon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {cfg.label}
                          </span>
                          {!n.read && <span className="size-2 rounded-full bg-primary" />}
                        </div>
                        <p className="mt-1 text-sm text-foreground">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{relativeDate(n.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
