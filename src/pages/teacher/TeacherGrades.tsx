// src/pages/teacher/TeacherGrades.tsx
import { useMemo, useState } from "react"
import { CheckCircle2, Plus, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ui/Loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { usePageData, useStore } from "@/hooks/usePageData"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { updateGradeStatus, addGrade } from "@/lib/store"
import type { Grade } from "@/types"

interface GradeRow extends Grade {
  studentName: string
  matricule: string
}

export function TeacherGrades() {
  const store = useStore()
  const { user } = useAuth()
  const [courseId, setCourseId] = useState<string>("all")
  const [addGradeOpen, setAddGradeOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newGrade, setNewGrade] = useState({
    courseId: "",
    studentId: "",
    score: "",
    type: "Examen" as const,
    session: "Session Normale",
  })

  const { data, loading } = usePageData((d) => {
    // Robust teacher lookup
    const teacherId = user?.refId
    const teacher = d.teachers.find((t) => t.id === teacherId) || d.teachers[0]

    if (!teacher) return { teacher: null, courses: [], grades: [] }

    const courses = d.courses.filter((c) => c.teacherId === teacher.id)
    const courseIds = new Set(courses.map((c) => c.id))
    const grades: GradeRow[] = (d.grades || [])
      .filter((g) => courseIds.has(g.courseId))
      .map((g) => {
        const student = d.students.find((s) => s.id === g.studentId)
        return {
          ...g,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu",
          matricule:   student?.matricule ?? "—",
        }
      })
    return { teacher, courses, grades }
  })

  const courseName = (id: string) => data?.courses?.find((c) => c.id === id)?.name ?? "Cours"

  const filtered = useMemo(() => {
    if (!data?.grades) return []
    return courseId === "all"
      ? data.grades
      : data.grades.filter((g) => g.courseId === courseId)
  }, [data, courseId])

  const handleValidate = (g: GradeRow) => {
    try {
      updateGradeStatus(g.id, "validated")
      toast.success(`Note validée pour ${g.studentName}`)
    } catch (e) {
      toast.error("Erreur lors de la validation")
    }
  }

  const handleAddGrade = () => {
    if (!newGrade.courseId || !newGrade.studentId || !newGrade.score) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    const scoreNum = Number(newGrade.score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 20) {
      toast.error("La note doit être comprise entre 0 et 20")
      return
    }

    setIsSubmitting(true)

    const student = store.students.find(s => s.id === newGrade.studentId)

    setTimeout(() => {
      try {
        addGrade({
          id: `g-${Date.now()}`,
          studentId: newGrade.studentId,
          courseId: newGrade.courseId,
          promotionId: student?.promotionId || "",
          score: scoreNum,
          status: "pending",
          session: newGrade.session,
          type: newGrade.type
        })
        toast.success("Note enregistrée avec succès")
        setIsSubmitting(false)
        setAddGradeOpen(false)
        setNewGrade({
          courseId: "",
          studentId: "",
          score: "",
          type: "Examen",
          session: "Session Normale",
        })
      } catch (e) {
        toast.error("Erreur lors de l'enregistrement")
        setIsSubmitting(false)
      }
    }, 500)
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
      key: "type",
      header: "Type",
      render: (g) => <Badge variant="secondary" className="text-[10px]">{g.type || "Examen"}</Badge>
    },
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
              <span className="hidden sm:inline ml-1">Valider</span>
            </Button>
          </div>
        ) : null,
    },
  ]

  if (loading || !data) return <Loader fullHeight />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saisie des notes"
        subtitle="Gestion des évaluations et validation des cotes."
        action={
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {(data.courses || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setAddGradeOpen(true)} className="gap-2 shadow-sm">
              <Plus className="size-4" />
              Saisir une note
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(g) => g.id}
        emptyTitle="Aucune note"
        emptyDescription="Aucune cote n'a encore été saisie pour ce cours."
      />

      <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Saisie d'une note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cours</Label>
              <Select value={newGrade.courseId} onValueChange={(v) => setNewGrade({...newGrade, courseId: v, studentId: ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un cours" />
                </SelectTrigger>
                <SelectContent>
                  {(data.courses || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Étudiant</Label>
              <Select value={newGrade.studentId} onValueChange={(v) => setNewGrade({...newGrade, studentId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder={newGrade.courseId ? "Sélectionnez un étudiant" : "Choisissez d'abord un cours"} />
                </SelectTrigger>
                <SelectContent>
                  {newGrade.courseId ? (
                    store.students
                      .filter(s => s.promotionId === store.courses.find(c => c.id === newGrade.courseId)?.promotionId)
                      .map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)
                  ) : (
                    <div className="p-2 text-center text-xs text-muted-foreground italic">Sélectionnez d'abord un cours</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newGrade.type} onValueChange={(v: any) => setNewGrade({...newGrade, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TD">TD</SelectItem>
                    <SelectItem value="TP">TP</SelectItem>
                    <SelectItem value="Interro">Interrogation</SelectItem>
                    <SelectItem value="Examen">Examen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note /20</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  placeholder="0.0"
                  value={newGrade.score}
                  onChange={e => setNewGrade({...newGrade, score: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGradeOpen(false)}>Annuler</Button>
            <Button onClick={handleAddGrade} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
