// src/pages/rectorat/RectoratAppeals.tsx
import { useMemo } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { usePageData } from "@/hooks/usePageData"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ui/Loader"
import { StatusBadge } from "@/components/ui/StatusBadge"

export function RectoratAppeals() {
  const { data, loading } = usePageData((d) => {
    const appeals = d.gradeAppeals.map(a => {
      const student = d.students.find(s => s.id === a.studentId)
      const course = d.courses.find(c => c.id === a.courseId)
      const grade = d.grades.find(g => g.id === a.gradeId)
      return {
        ...a,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu",
        courseName: course?.name ?? "Cours inconnu",
        originalScore: grade?.score ?? 0,
      }
    })
    return { appeals }
  })

  const columns: Column<any>[] = [
    {
      key: "student",
      header: "Étudiant",
      render: (row) => (
        <span className="font-medium">{row.studentName}</span>
      )
    },
    { key: "courseName", header: "Cours" },
    {
      key: "reason",
      header: "Motif",
      className: "max-w-[300px]",
      render: (row) => (
        <p className="truncate text-xs text-muted-foreground" title={row.reason}>
          {row.reason}
        </p>
      )
    },
    {
      key: "originalScore",
      header: "Note Initiale",
      align: "center",
      render: (row) => <span>{row.originalScore}/20</span>
    },
    {
      key: "estimatedGrade",
      header: "Note Estimée",
      align: "center",
      render: (row) => <span className="font-semibold text-primary">{row.estimatedGrade}/20</span>
    },
    {
      key: "status",
      header: "Statut",
      align: "center",
      render: (row) => <StatusBadge status={row.status} />
    }
  ]

  if (loading || !data) return <Loader fullHeight />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recours Académiques"
        subtitle="Suivi des contestations de notes soumises par les étudiants."
      />

      <DataTable
        columns={columns}
        data={data.appeals}
        rowKey={a => a.id}
        emptyTitle="Aucun recours"
        emptyDescription="Aucune contestation n'a été enregistrée."
      />
    </div>
  )
}
