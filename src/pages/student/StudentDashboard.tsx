// src/pages/student/StudentDashboard.tsx
import { BookOpen, GaugeCircle, CalendarClock, Award } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { ScheduleGrid } from "@/components/ScheduleGrid"
import { AnnouncementList } from "@/components/AnnouncementList"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import locales from "@/lib/locales.json"

export function StudentDashboard() {
  const { user } = useAuth()

  const { data, loading } = usePageData((d) => {
    const student  = d.students.find((s) => s.id === user?.refId) ?? d.students[0]
    const courses  = d.courses.filter((c) => c.promotionId === student.promotionId)
    const schedules = d.schedules.filter((s) => s.promotionId === student.promotionId)
    const grades   = d.grades.filter((g) => g.studentId === student.id)
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
        title={`${locales.common.greeting}, ${student.firstName}`}
        subtitle={`${student.matricule} · ${student.promotionId.toUpperCase()}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={locales.student.courses_enrolled}
          value={courses.length}
          subtitle={locales.student.current_semester}
          icon={BookOpen}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title={locales.student.general_average}
          value={`${student.average.toFixed(1)}/20`}
          subtitle={locales.common.session_in_progress}
          icon={GaugeCircle}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title={locales.rectorat.validated_grades_label}
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
