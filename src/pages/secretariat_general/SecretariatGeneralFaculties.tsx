// src/pages/secretariat_general/SecretariatGeneralFaculties.tsx
import { Building2, Users, BookOpen, UserSquare2, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { EmptyState } from "@/components/ui/EmptyState"
import { usePageData } from "@/hooks/usePageData"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { addFaculty, generateId } from "@/lib/store"
import { toast } from "sonner"

export function SecretariatGeneralFaculties() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", code: "", dean: "" })

  const handleAdd = () => {
    if (!form.name || !form.code) return
    addFaculty({
      id: generateId("f"),
      name: form.name,
      code: form.code,
      dean: form.dean || "À désigner"
    })
    toast.success("Faculté ajoutée avec succès")
    setForm({ name: "", code: "", dean: "" })
    setOpen(false)
  }

  const { data, loading } = usePageData((d) => {
    return d.faculties.map((f) => ({
      ...f,
      studentCount: d.students.filter((s) => s.facultyId === f.id).length,
      activeStudents: d.students.filter((s) => s.facultyId === f.id && s.status === "active").length,
      courseCount: d.courses.filter((c) => c.facultyId === f.id).length,
      teacherCount: d.teachers.filter((t) => t.facultyId === f.id).length,
      promotionCount: d.promotions.filter((p) => p.facultyId === f.id).length,
    }))
  })

  if (loading || !data) return <Loader fullHeight />

  return (
    <>
      <PageHeader
        title="Facultés"
        subtitle="Vue d'ensemble de toutes les entités académiques de l'institution."
        action={
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nouvelle Faculté
          </Button>
        }
      />

      {data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune faculté"
          description="Aucune faculté n'est enregistrée dans le système."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-chart-5/10 text-chart-5">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base text-pretty">{f.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">{f.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Doyen :</span> {f.dean}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      Étudiants
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">{f.studentCount}</p>
                    <p className="text-xs text-muted-foreground">{f.activeStudents} actifs</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Cours
                    </div>
                    <p className="mt-1 text-xl font-semibold text-foreground">{f.courseCount}</p>
                    <p className="text-xs text-muted-foreground">{f.promotionCount} promotions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                  <UserSquare2 className="size-4" />
                  <span>{f.teacherCount} enseignant{f.teacherCount > 1 ? "s" : ""}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une faculté</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la faculté</Label>
              <Input
                placeholder="ex: Sciences et Technologies"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Code / Sigle</Label>
              <Input
                placeholder="ex: ST"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Doyen</Label>
              <Input
                placeholder="Nom du Doyen"
                value={form.dean}
                onChange={e => setForm(f => ({ ...f, dean: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.code}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
