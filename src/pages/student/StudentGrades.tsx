// src/pages/student/StudentGrades.tsx
import { GaugeCircle, Award, FileClock } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { DataTable, type Column } from "@/src/components/ui/DataTable"
import { StatusBadge } from "@/src/components/ui/StatusBadge"
import { usePageData } from "@/src/hooks/usePageData"
import { useAuth } from "@/src/contexts/AuthContext"
import type { Grade } from "@/src/types"

interface GradeRow extends Grade {
  courseName: string
  courseCode: string
  credits: number
}

export function StudentGrades() {
  const { user } = useAuth()
  const studentId = user?.refId ?? "s1"

  const { data, loading } = usePageData((d) => {
    const student = d.students.find((s) => s.id === studentId) ?? d.students[0]
    const grades: GradeRow[] = d.grades
      .filter((g) => g.studentId === student.id)
      .map((g) => {
        const course = d.courses.find((c) => c.id === g.courseId)
        return {
          ...g,
          courseName: course?.name ?? "Cours",
          courseCode: course?.code ?? "—",
          credits: course?.credits ?? 0,
        }
      })
    const validated = grades.filter((g) => g.status === "validated")
    const pending = grades.filter((g) => g.status === "pending")
    return { student, grades, validated: validated.length, pending: pending.length }
  })

  const columns: Column<GradeRow>[] = [
    {
      key: "course",
      header: "Cours",
      render: (g) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{g.courseName}</p>
          <p className="font-mono text-xs text-muted-foreground">{g.courseCode}</p>
        </div>
      ),
    },
    { key: "credits", header: "Crédits", align: "center", render: (g) => g.credits },
    { key: "session", header: "Session", render: (g) => g.session },
    {
      key: "score",
      header: "Note",
      align: "center",
      render: (g) => (
        <span
          className={
            g.score >= 10 ? "font-semibold text-success" : "font-semibold text-destructive"
          }
        >
          {g.score}/20
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      align: "right",
      render: (g) => (
        <div className="flex justify-end">
          <StatusBadge status={g.status} />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Mes notes" subtitle="Vos résultats par cours et par session." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Moyenne générale"
          value={data ? `${data.student.average.toFixed(1)}/20` : "—"}
          icon={GaugeCircle}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Notes validées"
          value={data?.validated ?? 0}
          icon={Award}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="En attente"
          value={data?.pending ?? 0}
          icon={FileClock}
          colorClass="bg-chart-3/15 text-chart-3"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.grades ?? []}
        rowKey={(g) => g.id}
        loading={loading}
        emptyTitle="Aucune note"
        emptyDescription="Vos résultats apparaîtront ici dès leur publication."
      />
    </>
  )
}
