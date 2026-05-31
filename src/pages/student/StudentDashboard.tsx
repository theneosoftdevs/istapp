// src/pages/student/StudentDashboard.tsx
import { BookOpen, GaugeCircle, CalendarClock, Award } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { ScheduleGrid } from "@/src/components/ScheduleGrid"
import { AnnouncementList } from "@/src/components/AnnouncementList"
import { usePageData } from "@/src/hooks/usePageData"
import { useAuth } from "@/src/contexts/AuthContext"

export function StudentDashboard() {
  const { user } = useAuth()
  const studentId = user?.refId ?? "s1"

  const { data, loading } = usePageData((d) => {
    const student = d.students.find((s) => s.id === studentId) ?? d.students[0]
    const courses = d.courses.filter((c) => c.promotionId === student.promotionId)
    const schedules = d.schedules.filter((s) => s.promotionId === student.promotionId)
    const grades = d.grades.filter((g) => g.studentId === student.id)
    const announcements = d.announcements
      .filter((a) => a.audience === "all" || a.audience === "student")
      .sort((a, b) => b.date.localeCompare(a.date))
    const validated = grades.filter((g) => g.status === "validated").length
    return { student, courses, schedules, grades, announcements, validated }
  })

  if (loading || !data) return <Loader fullHeight />

  const { student, courses, schedules, announcements, grades, validated } = data

  return (
    <>
      <PageHeader
        title={`Bonjour, ${student.firstName}`}
        subtitle={`${student.matricule} · Promotion ${student.promotionId.toUpperCase()}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Cours inscrits"
          value={courses.length}
          subtitle="Ce semestre"
          icon={BookOpen}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Moyenne générale"
          value={`${student.average.toFixed(1)}/20`}
          subtitle="Session en cours"
          icon={GaugeCircle}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Notes validées"
          value={`${validated}/${grades.length}`}
          subtitle="Résultats publiés"
          icon={Award}
          colorClass="bg-chart-3/15 text-chart-3"
        />
        <KPICard
          title="Séances / semaine"
          value={schedules.length}
          subtitle="Emploi du temps"
          icon={CalendarClock}
          colorClass="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prochains cours</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleGrid slots={schedules} courses={courses} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dernières annonces</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementList items={announcements.slice(0, 3)} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
