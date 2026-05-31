// src/pages/secretariat_faculte/FacultyCourses.tsx
import { useState } from "react"
import { BookOpen, Clock, UserCheck } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/hooks/usePageData"
import { assignCourseToTeacher } from "@/lib/store"
import type { Course } from "@/types"

interface CourseRow extends Course {
  promotionName: string
  teacherName: string
  teacherTitle: string
}

export function FacultyCourses() {
  const store = useStore()
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [assignTarget, setAssignTarget] = useState<CourseRow | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState("")

  const rows: CourseRow[] = store.courses.map((c) => {
    const promotion = store.promotions.find((p) => p.id === c.promotionId)
    const teacher = store.teachers.find((t) => t.id === c.teacherId)
    return {
      ...c,
      promotionName: promotion?.name ?? "—",
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Non attribué",
      teacherTitle: teacher?.title ?? "",
    }
  })

  const filtered = facultyFilter === "all" ? rows : rows.filter((r) => r.facultyId === facultyFilter)

  const totalHours = filtered.reduce((acc, r) => acc + r.hours, 0)
  const totalCredits = filtered.reduce((acc, r) => acc + r.credits, 0)

  const teachersForDialog = assignTarget
    ? store.teachers.filter((t) => t.facultyId === assignTarget.facultyId)
    : []

  function handleAssign() {
    if (!assignTarget || !selectedTeacherId) return
    assignCourseToTeacher(assignTarget.id, selectedTeacherId)
    setAssignTarget(null)
    setSelectedTeacherId("")
  }

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
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-foreground">{c.teacherName}</p>
            {c.teacherTitle && (
              <p className="text-xs text-muted-foreground">{c.teacherTitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 text-xs"
            onClick={() => {
              setAssignTarget(c)
              setSelectedTeacherId(c.teacherId)
            }}
          >
            <UserCheck className="size-3.5" />
            Changer
          </Button>
        </div>
      ),
    },
    {
      key: "credits",
      header: "Crédits",
      align: "center",
      render: (c) => (
        <Badge variant="secondary" className="text-xs">
          {c.credits}
        </Badge>
      ),
    },
    {
      key: "hours",
      header: "Heures",
      align: "center",
      render: (c) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
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
        subtitle="Catalogue des cours — attribuez chaque cours à un enseignant."
        action={
          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Toutes les facultés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les facultés</SelectItem>
              {store.faculties.map((f) => (
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

      <Dialog
        open={assignTarget !== null}
        onOpenChange={(open) => {
          if (!open) { setAssignTarget(null); setSelectedTeacherId("") }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Attribuer un enseignant</DialogTitle>
          </DialogHeader>
          {assignTarget && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium text-foreground">{assignTarget.name}</p>
                <p className="text-muted-foreground">{assignTarget.promotionName}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Enseignant</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un enseignant…" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachersForDialog.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                        <span className="ml-1 text-muted-foreground">({t.title})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teachersForDialog.length === 0 && (
                  <p className="text-xs text-destructive">
                    Aucun enseignant disponible dans cette faculté.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setAssignTarget(null); setSelectedTeacherId("") }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedTeacherId || selectedTeacherId === assignTarget?.teacherId}
            >
              Attribuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
