// src/pages/teacher/TeacherDashboard.tsx
import { Users, FileClock, BookOpen, CalendarDays } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { ScheduleGrid } from "@/src/components/ScheduleGrid"
import { usePageData } from "@/src/hooks/usePageData"
import { useAuth } from "@/src/contexts/AuthContext"

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]

export function TeacherDashboard() {
  const { user } = useAuth()
  const teacherId = user?.refId ?? "t1"
  const todayName = DAYS[new Date().getDay()]

  const { data, loading } = usePageData((d) => {
    const teacher = d.teachers.find((t) => t.id === teacherId) ?? d.teachers[0]
    const courses = d.courses.filter((c) => c.teacherId === teacher.id)
    const promotionIds = new Set(courses.map((c) => c.promotionId))
    const students = d.students.filter((s) => promotionIds.has(s.promotionId))
    const courseIds = new Set(courses.map((c) => c.id))
    const pendingGrades = d.grades.filter(
      (g) => courseIds.has(g.courseId) && g.status === "pending",
    )
    const schedules = d.schedules.filter((s) => s.teacherId === teacher.id)
    const todaySlots = schedules.filter((s) => s.day === todayName)
    return { teacher, courses, students, pendingGrades, schedules, todaySlots }
  })

  if (loading || !data) return <Loader fullHeight />

  const { teacher, courses, students, pendingGrades, schedules, todaySlots } = data
  const hasToday = todaySlots.length > 0

  return (
    <>
      <PageHeader
        title={`Bonjour, ${teacher.title} ${teacher.lastName}`}
        subtitle={`${teacher.matricule} · ${courses.length} cours assignés`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Étudiants"
          value={students.length}
          subtitle="Toutes promotions"
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Notes en attente"
          value={pendingGrades.length}
          subtitle="À valider"
          icon={FileClock}
          colorClass="bg-chart-3/15 text-chart-3"
        />
        <KPICard
          title="Cours enseignés"
          value={courses.length}
          subtitle="Ce semestre"
          icon={BookOpen}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Séances / semaine"
          value={schedules.length}
          subtitle="Emploi du temps"
          icon={CalendarDays}
          colorClass="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emploi du temps du jour</CardTitle>
            <CardDescription>
              {hasToday
                ? `Séances de ${todayName.toLowerCase()}`
                : `Aucun cours aujourd'hui (${todayName.toLowerCase()}) — aperçu de la semaine`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleGrid
              slots={hasToday ? todaySlots : schedules}
              courses={courses}
              showDay={!hasToday}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes cours</CardTitle>
            <CardDescription>Cours dont vous avez la charge</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{c.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {c.credits} cr.
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
