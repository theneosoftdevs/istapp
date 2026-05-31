// src/pages/student/StudentAnnouncements.tsx
import { PageHeader } from "@/src/components/ui/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { AnnouncementList } from "@/src/components/AnnouncementList"
import { usePageData } from "@/src/hooks/usePageData"

export function StudentAnnouncements() {
  const { data, loading } = usePageData((d) =>
    d.announcements
      .filter((a) => a.audience === "all" || a.audience === "student")
      .sort((a, b) => b.date.localeCompare(a.date)),
  )

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title="Annonces"
        subtitle="Communications de l'administration et de votre faculté."
      />
      <Card>
        <CardContent className="p-5">
          <AnnouncementList items={data} />
        </CardContent>
      </Card>
    </>
  )
}
