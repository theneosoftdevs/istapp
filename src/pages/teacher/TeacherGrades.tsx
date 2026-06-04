// src/pages/teacher/TeacherGrades.tsx
import { useMemo, useState } from "react"
import { CheckCircle2, Plus, Loader2, ArrowLeft, Save, Edit2, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ui/Loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { updateGradeStatus, addGrade, updateGrade, removeGrade } from "@/lib/store"
import type { Grade, Student } from "@/types"

interface GradeRow extends Grade {
  studentName: string
  matricule: string
}

export function TeacherGrades() {
  const store = useStore()
  const { user } = useAuth()
  const [courseId, setCourseId] = useState<string>("all")
  const [addGradeOpen, setAddGradeOpen] = useState(false)

  // Session states
  const [isSessionMode, setIsSessionMode] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    courseId: "",
    title: "",
    type: "Interro" as Grade["type"],
  })

  const { data, loading } = usePageData((d) => {
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

  const startSession = () => {
    if (!sessionForm.courseId || !sessionForm.title.trim()) {
      toast.error("Veuillez sélectionner un cours et donner un titre à l'évaluation")
      return
    }
    setIsSessionMode(true)
    setAddGradeOpen(false)
  }

  // --- Session Mode Logic ---
  const currentCourse = store.courses.find(c => c.id === sessionForm.courseId)
  const promotionStudents = useMemo(() => {
    if (!currentCourse) return []
    return store.students.filter(s => s.promotionId === currentCourse.promotionId)
  }, [currentCourse, store.students])

  const sessionGrades = useMemo(() => {
    return store.grades.filter(g =>
      g.courseId === sessionForm.courseId &&
      g.title === sessionForm.title &&
      g.type === sessionForm.type
    )
  }, [store.grades, sessionForm])

  const gradedStudents = useMemo(() => {
    return promotionStudents.filter(s => sessionGrades.some(g => g.studentId === s.id))
  }, [promotionStudents, sessionGrades])

  const ungradedStudents = useMemo(() => {
    return promotionStudents.filter(s => !sessionGrades.some(g => g.studentId === s.id))
  }, [promotionStudents, sessionGrades])

  const handleSaveGrade = (studentId: string, scoreStr: string) => {
    const score = parseFloat(scoreStr)
    if (isNaN(score) || score < 0 || score > 20) {
      toast.error("Note invalide (0-20)")
      return
    }

    const existing = sessionGrades.find(g => g.studentId === studentId)
    if (existing) {
      updateGrade({ ...existing, score })
      toast.success("Note mise à jour")
    } else {
      addGrade({
        id: `g-${Date.now()}-${studentId}`,
        studentId,
        courseId: sessionForm.courseId,
        promotionId: currentCourse?.promotionId || "",
        score,
        status: "pending",
        session: "Session Normale",
        type: sessionForm.type,
        title: sessionForm.title
      })
      toast.success("Note enregistrée")
    }
  }

  const handleDeleteGrade = (gradeId: string) => {
    removeGrade(gradeId)
    toast.success("Note supprimée")
  }

  if (loading || !data) return <Loader fullHeight />

  if (isSessionMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSessionMode(false)}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Session de cotation</h1>
            <p className="text-sm text-muted-foreground">
              {courseName(sessionForm.courseId)} — {sessionForm.title} ({sessionForm.type})
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Section: Notes déjà saisies */}
          <Card className="border-success/20">
            <CardHeader className="bg-success/5 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Notes déjà saisies ({gradedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Étudiant</th>
                      <th className="px-4 py-2 text-center font-medium">Note /20</th>
                      <th className="px-4 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {gradedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                          Aucune note saisie pour le moment.
                        </td>
                      </tr>
                    ) : (
                      gradedStudents.map(student => {
                        const grade = sessionGrades.find(g => g.studentId === student.id)!
                        return (
                          <tr key={student.id} className="hover:bg-muted/30">
                            <td className="px-4 py-2">
                              <p className="font-medium">{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{student.matricule}</p>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Input
                                type="number"
                                step="0.5"
                                defaultValue={grade.score}
                                className="w-20 mx-auto text-center h-8"
                                onBlur={(e) => {
                                  if (parseFloat(e.target.value) !== grade.score) {
                                    handleSaveGrade(student.id, e.target.value)
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveGrade(student.id, (e.target as HTMLInputElement).value)
                                    ;(e.target as HTMLInputElement).blur()
                                  }
                                }}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteGrade(grade.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section: Étudiants à coter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Étudiants à coter ({ungradedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Étudiant</th>
                      <th className="px-4 py-2 text-center font-medium">Note /20</th>
                      <th className="px-4 py-2 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ungradedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                          Tous les étudiants ont été cotés.
                        </td>
                      </tr>
                    ) : (
                      ungradedStudents.map(student => (
                        <tr key={student.id} className="hover:bg-muted/30">
                          <td className="px-4 py-2">
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{student.matricule}</p>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="—"
                              className="w-20 mx-auto text-center h-8"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveGrade(student.id, (e.target as HTMLInputElement).value)
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value) {
                                  handleSaveGrade(student.id, e.target.value)
                                  e.target.value = "" // Reset input after moving
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className="text-[10px] text-muted-foreground">Appuyez sur Entrée pour valider</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
      render: (g) => (
        <div className="flex flex-col">
          <Badge variant="secondary" className="text-[10px] w-fit">{g.type || "Examen"}</Badge>
          {g.title && <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[100px]">{g.title}</span>}
        </div>
      )
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
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="outline" onClick={() => handleValidate(g)} className="h-8">
              <CheckCircle2 className="size-3.5 mr-1" />
              Valider
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-destructive hover:bg-destructive/10"
              onClick={() => removeGrade(g.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ) : null,
    },
  ]

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
              Saisie rapide
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

      {/* Dialog for starting a session */}
      <Dialog open={addGradeOpen} onOpenChange={setAddGradeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouvelle session de cotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cours</Label>
              <Select
                value={sessionForm.courseId}
                onValueChange={(v) => setSessionForm({...sessionForm, courseId: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un cours" />
                </SelectTrigger>
                <SelectContent>
                  {(data.courses || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Titre de l'évaluation</Label>
              <Input
                placeholder="Ex : Chapitre 1 — Introduction"
                value={sessionForm.title}
                onChange={e => setSessionForm({...sessionForm, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={sessionForm.type} onValueChange={(v: any) => setSessionForm({...sessionForm, type: v})}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGradeOpen(false)}>Annuler</Button>
            <Button onClick={startSession}>
              Démarrer la saisie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
