// src/pages/rectorat/RectoratDashboard.tsx
import { Users, GraduationCap, TrendingUp, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export function RectoratDashboard() {
  const { user } = useAuth()

  const { data, loading } = usePageData((d) => {
    const totalStudents = d.students.length
    const activeStudents = d.students.filter((s) => s.status === "active").length
    const validatedGrades = d.grades.filter((g) => g.status === "validated").length
    const pendingGrades = d.grades.filter((g) => g.status === "pending").length

    const byFaculty = d.faculties.map((f) => ({
      name: f.code,
      fullName: f.name,
      etudiants: d.students.filter((s) => s.facultyId === f.id).length,
    }))

    const recentActivity = [
      {
        label: "Notes validées",
        value: validatedGrades,
        total: d.grades.length,
        percent: d.grades.length ? Math.round((validatedGrades / d.grades.length) * 100) : 0,
      },
      {
        label: "Étudiants actifs",
        value: activeStudents,
        total: totalStudents,
        percent: totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 0,
      },
    ]

    return {
      totalStudents,
      activeStudents,
      totalFaculties: d.faculties.length,
      totalCourses: d.courses.length,
      validatedGrades,
      pendingGrades,
      byFaculty,
      recentActivity,
    }
  })

  if (loading || !data) return <Loader fullHeight />

  const userName = user?.name ?? "Madame / Monsieur le Recteur"

  return (
    <>
      <PageHeader
        title={`Bonjour, ${userName}`}
        subtitle="Vue institutionnelle consolidée — Rectorat."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Étudiants"
          value={data.totalStudents}
          subtitle={`${data.activeStudents} actifs`}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Facultés"
          value={data.totalFaculties}
          subtitle="Entités académiques"
          icon={GraduationCap}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Cours actifs"
          value={data.totalCourses}
          subtitle="Ce semestre"
          icon={BookOpen}
          colorClass="bg-chart-4/10 text-chart-4"
        />
        <KPICard
          title="Notes en attente"
          value={data.pendingGrades}
          subtitle={`${data.validatedGrades} validées`}
          icon={TrendingUp}
          colorClass="bg-chart-3/15 text-chart-3"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Effectifs par faculté</CardTitle>
            <CardDescription>Nombre d'étudiants inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byFaculty} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                  labelFormatter={(label: string) => {
                    const item = data.byFaculty.find((f) => f.name === label)
                    return item?.fullName ?? label
                  }}
                />
                <Bar dataKey="etudiants" name="Étudiants" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold text-foreground">
                    {item.value}/{item.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <p className="text-right text-xs text-muted-foreground">{item.percent}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
