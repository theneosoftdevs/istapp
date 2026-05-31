// src/pages/teacher/TeacherCourses.tsx
import { Users, BookOpen, Clock } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { usePageData } from "@/src/hooks/usePageData"
import { useAuth } from "@/src/contexts/AuthContext"

export function TeacherCourses() {
  const { user } = useAuth()
  const teacherId = user?.refId ?? "t1"

  const { data, loading } = usePageData((d) => {
    const teacher = d.teachers.find((t) => t.id === teacherId) ?? d.teachers[0]
    const courses = d.courses
      .filter((c) => c.teacherId === teacher.id)
      .map((c) => {
        const promotion = d.promotions.find((p) => p.id === c.promotionId)
        const studentCount = d.students.filter((s) => s.promotionId === c.promotionId).length
        return { ...c, promotionName: promotion?.name ?? "—", studentCount }
      })
    return { teacher, courses }
  })

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title="Mes cours"
        subtitle="Les cours dont vous avez la charge ce semestre."
      />

      {data.courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucun cours ne vous est assigné pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.courses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {c.credits} crédits
                  </span>
                </div>
                <CardTitle className="text-base text-pretty">{c.name}</CardTitle>
                <CardDescription>{c.promotionName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" />
                    {c.studentCount} étudiants
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {c.hours}h
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
