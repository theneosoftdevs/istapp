// src/pages/teacher/TeacherGrades.tsx
import { useMemo, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Loader } from "@/components/ui/Loader"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePageData } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { updateGradeStatus } from "@/lib/store"
import type { Grade } from "@/types"

interface GradeRow extends Grade {
  studentName: string
  matricule: string
}

export function TeacherGrades() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [courseId, setCourseId] = useState<string>("all")

  const { data, loading } = usePageData((d) => {
    const teacher  = d.teachers.find((t) => t.id === user?.refId) ?? d.teachers[0]
    const courses  = d.courses.filter((c) => c.teacherId === teacher.id)
    const courseIds = new Set(courses.map((c) => c.id))
    const grades: GradeRow[] = d.grades
      .filter((g) => courseIds.has(g.courseId))
      .map((g) => {
        const student = d.students.find((s) => s.id === g.studentId)
        return {
          ...g,
          studentName: student ? `${student.firstName} ${student.lastName}` : "—",
          matricule:   student?.matricule ?? "—",
        }
      })
    return { teacher, courses, grades }
  })

  const courseName = (id: string) => data?.courses.find((c) => c.id === id)?.name ?? "Cours"

  const filtered = useMemo(() => {
    if (!data) return []
    return courseId === "all"
      ? data.grades
      : data.grades.filter((g) => g.courseId === courseId)
  }, [data, courseId])

  const handleValidate = (g: GradeRow) => {
    updateGradeStatus(g.id, "validated")
    toast({
      title: "Note validée",
      description: `${g.studentName} · ${g.score}/20 en ${courseName(g.courseId)}.`,
    })
  }

  const columns: Column<GradeRow>[] = [
    {
      key: "student",
      header: "Étudiant",
      render: (g) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{g.studentName}</p>
          <p className="font-mono text-xs text-muted-foreground">{g.matricule}</p>
        </div>
      ),
    },
    { key: "course", header: "Cours", render: (g) => courseName(g.courseId) },
    {
      key: "score",
      header: "Note",
      align: "center",
      render: (g) => <span className="font-semibold">{g.score}/20</span>,
    },
    {
      key: "status",
      header: "Statut",
      align: "center",
      render: (g) => <StatusBadge status={g.status} />,
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (g) =>
        g.status === "pending" ? (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => handleValidate(g)}>
              <CheckCircle2 className="size-4" />
              Valider
            </Button>
          </div>
        ) : null,
    },
  ]

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title="Saisie des notes"
        subtitle="Consultez et validez les notes de vos étudiants."
        action={
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filtrer par cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {data.courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(g) => g.id}
        emptyTitle="Aucune note"
        emptyDescription="Aucune note à afficher pour ce cours."
      />
    </>
  )
}
