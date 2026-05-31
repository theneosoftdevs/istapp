// src/pages/secretariat_general/SecretariatGeneralNotifications.tsx
import { Bell, CheckCheck, BookOpen, AlertCircle, Star, BookMarked } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/src/hooks/usePageData"
import { markNotificationRead, markAllNotificationsRead } from "@/src/lib/store"
import type { Notification } from "@/src/types"

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: typeof Bell; label: string; color: string }
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

export function SecretariatGeneralNotifications() {
  const store = useStore()

  const myNotifications = store.notifications
    .filter((n) => n.targetRole === "secretariat_general")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const unread = myNotifications.filter((n) => !n.read).length

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Alertes de modification de notes, nouveaux recours et attributions de cours."
        action={
          unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => markAllNotificationsRead("secretariat_general")}
            >
              <CheckCheck className="size-4" />
              Tout marquer lu
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Non lues"
          value={unread}
          icon={Bell}
          colorClass="bg-chart-4/10 text-chart-4"
        />
        <KPICard
          title="Total"
          value={myNotifications.length}
          icon={BookOpen}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Lues"
          value={myNotifications.filter((n) => n.read).length}
          icon={CheckCheck}
          colorClass="bg-chart-1/10 text-chart-1"
        />
      </div>

      {myNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Aucune notification</p>
              <p className="text-sm text-muted-foreground">
                Les alertes de modifications de notes et recours apparaîtront ici.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {myNotifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type]
            const NIcon = cfg.icon
            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => !n.read && markNotificationRead(n.id)}
                onKeyDown={(e) => e.key === "Enter" && !n.read && markNotificationRead(n.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !n.read && "border-primary/20 bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    cfg.color,
                  )}
                >
                  <NIcon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      {cfg.label}
                    </Badge>
                    {!n.read && (
                      <span className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relativeDate(n.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
