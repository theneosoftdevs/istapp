// src/pages/secretariat_general/SecretariatGeneralDashboard.tsx
import { Users, Building2, BookOpen, UserSquare2 } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { AnnouncementList } from "@/src/components/AnnouncementList"
import { usePageData } from "@/src/hooks/usePageData"

export function SecretariatGeneralDashboard() {
  const { data, loading } = usePageData((d) => {
    const totalStudents = d.students.length
    const activeStudents = d.students.filter((s) => s.status === "active").length
    const byFaculty = d.faculties.map((f) => ({
      id: f.id,
      name: f.name,
      code: f.code,
      dean: f.dean,
      studentCount: d.students.filter((s) => s.facultyId === f.id).length,
      courseCount: d.courses.filter((c) => c.facultyId === f.id).length,
      teacherCount: d.teachers.filter((t) => t.facultyId === f.id).length,
    }))
    const recentAnnouncements = d.announcements
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
    return {
      totalStudents,
      activeStudents,
      totalFaculties: d.faculties.length,
      totalTeachers: d.teachers.length,
      totalCourses: d.courses.length,
      byFaculty,
      recentAnnouncements,
    }
  })

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title="Tableau de bord — Secrétariat Général"
        subtitle="Vue d'ensemble de l'institution."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Étudiants inscrits"
          value={data.totalStudents}
          subtitle={`${data.activeStudents} actifs`}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Facultés"
          value={data.totalFaculties}
          subtitle="Entités académiques"
          icon={Building2}
          colorClass="bg-chart-5/10 text-chart-5"
        />
        <KPICard
          title="Enseignants"
          value={data.totalTeachers}
          subtitle="Corps enseignant"
          icon={UserSquare2}
          colorClass="bg-chart-3/15 text-chart-3"
        />
        <KPICard
          title="Cours"
          value={data.totalCourses}
          subtitle="Unités d'enseignement"
          icon={BookOpen}
          colorClass="bg-chart-4/10 text-chart-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition par faculté</CardTitle>
            <CardDescription>Effectifs étudiants et ressources pédagogiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Faculté</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Étudiants</th>
                    <th className="pb-3 text-center font-medium text-muted-foreground">Cours</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Enseignants</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byFaculty.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-foreground">{f.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
                      </td>
                      <td className="py-3 text-center font-semibold text-foreground">{f.studentCount}</td>
                      <td className="py-3 text-center text-muted-foreground">{f.courseCount}</td>
                      <td className="py-3 text-right text-muted-foreground">{f.teacherCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annonces récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <AnnouncementList items={data.recentAnnouncements} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
