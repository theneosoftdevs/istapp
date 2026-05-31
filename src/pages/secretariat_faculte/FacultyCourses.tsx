// src/pages/secretariat_faculte/FacultyCourses.tsx
import { useState } from "react"
import { BookOpen, Clock } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { DataTable, type Column } from "@/src/components/ui/DataTable"
import { Loader } from "@/src/components/ui/Loader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePageData } from "@/src/hooks/usePageData"
import type { Course } from "@/src/types"

interface CourseRow extends Course {
  promotionName: string
  teacherName: string
  teacherTitle: string
}

export function FacultyCourses() {
  const [facultyId, setFacultyId] = useState("all")

  const { data, loading } = usePageData((d) => {
    const rows: CourseRow[] = d.courses.map((c) => {
      const promotion = d.promotions.find((p) => p.id === c.promotionId)
      const teacher = d.teachers.find((t) => t.id === c.teacherId)
      return {
        ...c,
        promotionName: promotion?.name ?? "—",
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "—",
        teacherTitle: teacher?.title ?? "",
      }
    })
    return { rows, faculties: d.faculties }
  })

  if (loading || !data) return <Loader fullHeight />

  const filtered =
    facultyId === "all" ? data.rows : data.rows.filter((r) => r.facultyId === facultyId)

  const totalHours = filtered.reduce((acc, r) => acc + r.hours, 0)
  const totalCredits = filtered.reduce((acc, r) => acc + r.credits, 0)

  const columns: Column<CourseRow>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => <span className="font-mono text-xs">{c.code}</span>,
    },
    {
      key: "name",
      header: "Cours",
      render: (c) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.promotionName}</p>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Enseignant",
      render: (c) => (
        <div className="min-w-0">
          <p className="text-foreground">{c.teacherName}</p>
          <p className="text-xs text-muted-foreground">{c.teacherTitle}</p>
        </div>
      ),
    },
    {
      key: "credits",
      header: "Crédits",
      align: "center",
      render: (c) => (
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {c.credits}
        </span>
      ),
    },
    {
      key: "hours",
      header: "Heures",
      align: "center",
      render: (c) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="size-3.5" />
          {c.hours}h
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Cours"
        subtitle="Catalogue des cours par faculté."
        action={
          <Select value={facultyId} onValueChange={setFacultyId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Toutes les facultés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les facultés</SelectItem>
              {data.faculties.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KPICard
          title="Cours"
          value={filtered.length}
          subtitle="Unités d'enseignement"
          icon={BookOpen}
          colorClass="bg-chart-4/10 text-chart-4"
        />
        <KPICard
          title="Volume horaire total"
          value={`${totalHours}h`}
          subtitle={`${totalCredits} crédits`}
          icon={Clock}
          colorClass="bg-chart-2/10 text-chart-2"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(c) => c.id}
        emptyTitle="Aucun cours"
        emptyDescription="Aucun cours à afficher pour cette faculté."
      />
    </>
  )
}
