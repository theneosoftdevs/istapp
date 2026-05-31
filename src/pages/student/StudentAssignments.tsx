// src/pages/student/StudentAssignments.tsx
import { useState } from "react"
import { ClipboardCheck, Clock, CheckCircle2, Star } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { addSubmission, nextSubmissionId } from "@/src/lib/store"

export function StudentAssignments() {
  const store   = useStore()
  const student = useCurrentStudent(store)

  const myCourseIds = store.courses
    .filter((c) => c.promotionId === student.promotionId)
    .map((c) => c.id)

  const assignments = store.assignments
    .filter((a) => myCourseIds.includes(a.courseId))
    .map((a) => {
      const course      = store.courses.find((c) => c.id === a.courseId)
      const submission  = store.submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === student.id,
      )
      const isOverdue = !submission && new Date(a.dueDate) < new Date()
      return { ...a, courseName: course?.name ?? "Cours", submission, isOverdue }
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const todo      = assignments.filter((a) => !a.submission && !a.isOverdue).length
  const submitted = assignments.filter((a) => a.submission).length
  const graded    = assignments.filter((a) => a.submission?.grade !== undefined).length

  const [submitTarget, setSubmitTarget] = useState<(typeof assignments)[0] | null>(null)
  const [content, setContent]           = useState("")

  function handleSubmit() {
    if (!submitTarget || !content.trim()) return
    addSubmission({
      id:           nextSubmissionId(),
      assignmentId: submitTarget.id,
      studentId:    student.id,
      content:      content.trim(),
      submittedAt:  new Date().toISOString(),
    })
    setSubmitTarget(null)
    setContent("")
  }

  function closeDialog() {
    setSubmitTarget(null)
    setContent("")
  }

  return (
    <>
      <PageHeader
        title="Travaux"
        subtitle="Les travaux à remettre pour vos cours ce semestre."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="À remettre" value={todo}      icon={ClipboardCheck} colorClass="bg-chart-4/10 text-chart-4" />
        <KPICard title="Remis"      value={submitted}  icon={CheckCircle2}   colorClass="bg-chart-1/10 text-chart-1" />
        <KPICard title="Corrigés"   value={graded}     icon={Star}           colorClass="bg-chart-2/10 text-chart-2" />
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucun travail pour vos cours pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const statusLabel =
              a.submission?.grade !== undefined ? "Corrigé"
              : a.submission      ? "Remis"
              : a.isOverdue       ? "Délai dépassé"
              : "À remettre"

            const statusClass =
              a.submission?.grade !== undefined ? "border-success text-success"
              : a.submission      ? "border-chart-2 text-chart-2"
              : a.isOverdue       ? "border-destructive text-destructive"
              : "border-warning text-warning"

            return (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <CardDescription>
                        {a.courseName} · Échéance : {a.dueDate}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`shrink-0 ${statusClass}`}>
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {a.description && (
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  )}

                  {a.submission ? (
                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                      <p className="mb-1 font-medium text-foreground">Ma remise :</p>
                      <p className="text-muted-foreground">{a.submission.content}</p>
                      {a.submission.grade !== undefined && (
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                          <span className="text-xs text-muted-foreground">Note :</span>
                          <span
                            className={`text-sm font-semibold ${
                              a.submission.grade >= 10 ? "text-success" : "text-destructive"
                            }`}
                          >
                            {a.submission.grade}/20
                          </span>
                        </div>
                      )}
                      {a.submission.feedback && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-medium">Commentaire : </span>
                          {a.submission.feedback}
                        </p>
                      )}
                    </div>
                  ) : !a.isOverdue ? (
                    <Button size="sm" className="gap-1.5" onClick={() => setSubmitTarget(a)}>
                      <Clock className="size-4" />
                      Remettre le travail
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={submitTarget !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Remettre le travail</DialogTitle>
          </DialogHeader>
          {submitTarget && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium text-foreground">{submitTarget.title}</p>
                <p className="text-muted-foreground">{submitTarget.courseName}</p>
              </div>
              <div className="space-y-1.5">
                <Label>Votre travail</Label>
                <Textarea
                  placeholder="Rédigez votre réponse, collez un lien ou décrivez votre livrable…"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez aussi coller un lien vers Google Drive ou GitHub.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>Soumettre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
