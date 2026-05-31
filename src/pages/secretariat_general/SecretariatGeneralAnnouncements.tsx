// src/pages/secretariat_general/SecretariatGeneralAnnouncements.tsx
import { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { AnnouncementList } from "@/components/AnnouncementList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { usePageData } from "@/hooks/usePageData"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Role } from "@/types"

type AudienceFilter = Role | "all"

export function SecretariatGeneralAnnouncements() {
  const [audience, setAudience] = useState<AudienceFilter>("all")

  const { data, loading } = usePageData((d) =>
    d.announcements.sort((a, b) => b.date.localeCompare(a.date)),
  )

  if (loading || !data) return <Loader fullHeight />

  const filtered =
    audience === "all"
      ? data
      : data.filter((a) => a.audience === audience || a.audience === "all")

  const counts = {
    info: data.filter((a) => a.priority === "info").length,
    important: data.filter((a) => a.priority === "important").length,
    urgent: data.filter((a) => a.priority === "urgent").length,
  }

  return (
    <>
      <PageHeader
        title="Annonces"
        subtitle="Communications officielles de l'institution."
        action={
          <Select value={audience} onValueChange={(v) => setAudience(v as AudienceFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les audiences</SelectItem>
              <SelectItem value="student">Étudiants</SelectItem>
              <SelectItem value="teacher">Enseignants</SelectItem>
              <SelectItem value="apparitorat">Apparitorat</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">{data.length} annonce{data.length > 1 ? "s" : ""} au total :</span>
        <StatusBadge status="urgent" />
        <span className="text-sm text-muted-foreground">×{counts.urgent}</span>
        <StatusBadge status="important" />
        <span className="text-sm text-muted-foreground">×{counts.important}</span>
        <StatusBadge status="info" />
        <span className="text-sm text-muted-foreground">×{counts.info}</span>
      </div>

      <Card>
        <CardContent className="p-5">
          <AnnouncementList items={filtered} />
        </CardContent>
      </Card>
    </>
  )
}
