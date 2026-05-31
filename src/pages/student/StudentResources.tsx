// src/pages/student/StudentResources.tsx
import { FileText, Video, Link2, File, ExternalLink, FolderOpen } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useStore } from "@/src/hooks/usePageData"
import { useAuth } from "@/src/contexts/AuthContext"
import type { CourseResource } from "@/src/types"

const RESOURCE_ICONS: Record<CourseResource["type"], typeof FileText> = {
  pdf: FileText,
  video: Video,
  link: Link2,
  doc: File,
}

const RESOURCE_LABELS: Record<CourseResource["type"], string> = {
  pdf: "PDF",
  video: "Vidéo",
  link: "Lien web",
  doc: "Document",
}

const RESOURCE_COLORS: Record<CourseResource["type"], string> = {
  pdf: "bg-destructive/10 text-destructive",
  video: "bg-chart-2/10 text-chart-2",
  link: "bg-chart-5/10 text-chart-5",
  doc: "bg-chart-3/10 text-chart-3",
}

export function StudentResources() {
  const { user } = useAuth()
  const studentId = user?.refId ?? "s1"
  const store = useStore()

  const student = store.students.find((s) => s.id === studentId) ?? store.students[0]

  const coursesWithResources = store.courses
    .filter((c) => c.promotionId === student.promotionId)
    .map((c) => {
      const teacher = store.teachers.find((t) => t.id === c.teacherId)
      const resources = store.courseResources.filter((r) => r.courseId === c.id)
      return {
        ...c,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "—",
        resources,
      }
    })
    .filter((c) => c.resources.length > 0)

  const totalResources = coursesWithResources.reduce((acc, c) => acc + c.resources.length, 0)

  return (
    <>
      <PageHeader
        title="Ressources de cours"
        subtitle="Documents, vidéos et liens partagés par vos enseignants."
      />

      {coursesWithResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="size-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Aucune ressource disponible</p>
              <p className="text-sm text-muted-foreground">
                Vos enseignants partageront ici des documents et liens utiles.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalResources} ressource{totalResources !== 1 ? "s" : ""} disponible
            {totalResources !== 1 ? "s" : ""} dans {coursesWithResources.length} cours
          </p>

          <div className="space-y-6">
            {coursesWithResources.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{c.code}</span> ·{" "}
                        {c.teacherName}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {c.resources.length} ressource{c.resources.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {c.resources.map((r) => {
                      const RIcon = RESOURCE_ICONS[r.type]
                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors"
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${RESOURCE_COLORS[r.type]}`}
                          >
                            <RIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {r.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {RESOURCE_LABELS[r.type]} · Ajouté le {r.createdAt}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1.5"
                            asChild
                          >
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-3.5" />
                              Ouvrir
                            </a>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  )
}
