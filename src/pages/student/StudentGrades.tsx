// src/pages/student/StudentGrades.tsx
import { useState } from "react"
import { GaugeCircle, Award, FileClock, AlertCircle } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { DataTable, type Column } from "@/src/components/ui/DataTable"
import { StatusBadge } from "@/src/components/ui/StatusBadge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useStore } from "@/src/hooks/usePageData"
import { useCurrentStudent } from "@/src/hooks/useCurrentUser"
import { addGradeAppeal, nextAppealId } from "@/src/lib/store"
import type { Grade } from "@/src/types"

interface GradeRow extends Grade {
  courseName: string
  courseCode: string
  credits: number
  appealStatus: "pending" | "approved" | "rejected" | null
}

export function StudentGrades() {
  const store   = useStore()
  const student = useCurrentStudent(store)

  const grades: GradeRow[] = store.grades
    .filter((g) => g.studentId === student.id)
    .map((g) => {
      const course  = store.courses.find((c) => c.id === g.courseId)
      const appeal  = store.gradeAppeals.find(
        (a) => a.gradeId === g.id && a.studentId === student.id,
      )
      return {
        ...g,
        courseName:   course?.name     ?? "Cours",
        courseCode:   course?.code     ?? "—",
        credits:      course?.credits  ?? 0,
        appealStatus: appeal?.status   ?? null,
      }
    })

  const validated = grades.filter((g) => g.status === "validated").length
  const pending   = grades.filter((g) => g.status === "pending").length

  const [appealGrade, setAppealGrade] = useState<GradeRow | null>(null)
  const [reason, setReason] = useState("")

  function handleAppeal() {
    if (!appealGrade || !reason.trim()) return
    addGradeAppeal({
      id:        nextAppealId(),
      studentId: student.id,
      courseId:  appealGrade.courseId,
      gradeId:   appealGrade.id,
      reason:    reason.trim(),
      status:    "pending",
      createdAt: new Date().toISOString(),
    })
    setAppealGrade(null)
    setReason("")
  }

  function closeDialog() {
    setAppealGrade(null)
    setReason("")
  }

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
        <span className={g.score >= 10 ? "font-semibold text-success" : "font-semibold text-destructive"}>
          {g.score}/20
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      align: "center",
      render: (g) => <StatusBadge status={g.status} />,
    },
    {
      key: "appeal",
      header: "Recours",
      align: "right",
      render: (g) => {
        if (g.appealStatus === "pending")
          return <Badge variant="outline" className="border-warning text-warning text-xs">En cours</Badge>
        if (g.appealStatus === "approved")
          return <Badge variant="outline" className="border-success text-success text-xs">Approuvé</Badge>
        if (g.appealStatus === "rejected")
          return <Badge variant="outline" className="border-destructive text-destructive text-xs">Rejeté</Badge>
        if (g.status !== "validated") return null
        return (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setAppealGrade(g)}>
            <AlertCircle className="size-3.5" />
            Contester
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader title="Mes notes" subtitle="Vos résultats par cours et par session." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Moyenne générale" value={`${student.average.toFixed(1)}/20`} icon={GaugeCircle} colorClass="bg-chart-2/10 text-chart-2" />
        <KPICard title="Notes validées"   value={validated}                           icon={Award}        colorClass="bg-chart-1/10 text-chart-1" />
        <KPICard title="En attente"       value={pending}                             icon={FileClock}    colorClass="bg-chart-3/15 text-chart-3" />
      </div>

      <DataTable
        columns={columns}
        data={grades}
        rowKey={(g) => g.id}
        emptyTitle="Aucune note"
        emptyDescription="Vos résultats apparaîtront ici dès leur publication."
      />

      <Dialog open={appealGrade !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contester une note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {appealGrade && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium text-foreground">{appealGrade.courseName}</p>
                <p className="text-muted-foreground">
                  Note actuelle : <span className="font-semibold">{appealGrade.score}/20</span>
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Motif du recours</Label>
              <Textarea
                placeholder="Expliquez pourquoi vous contestez cette note…"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Votre demande sera transmise au secrétariat général.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button onClick={handleAppeal} disabled={!reason.trim()}>
              Soumettre le recours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
