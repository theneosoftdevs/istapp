// src/pages/secretariat_general/SecretariatGeneralPromotions.tsx
import { useState } from "react"
import { GraduationCap, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
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
import { useStore } from "@/hooks/usePageData"
import { addPromotion, nextPromotionId } from "@/lib/store"
import { toast } from "sonner"
import type { Promotion } from "@/types"

interface PromotionRow extends Promotion {
  facultyName: string
}

export function SecretariatGeneralPromotions() {
  const store = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    level: "1",
    facultyId: "",
    studentCount: 50
  })

  const rows: PromotionRow[] = store.promotions.map(p => ({
    ...p,
    facultyName: store.faculties.find(f => f.id === p.facultyId)?.name ?? "—"
  }))

  const handleAdd = () => {
    if (!form.name || !form.facultyId) return
    addPromotion({
      id: nextPromotionId(),
      name: form.name,
      level: parseInt(form.level),
      facultyId: form.facultyId,
      studentCount: form.studentCount
    })
    toast.success("Promotion créée avec succès")
    setForm({ name: "", level: "1", facultyId: "", studentCount: 50 })
    setOpen(false)
  }

  const columns: Column<PromotionRow>[] = [
    { key: "name", header: "Promotion", render: p => <span className="font-medium">{p.name}</span> },
    { key: "level", header: "Niveau", render: p => `Année ${p.level}` },
    { key: "faculty", header: "Faculté", render: p => p.facultyName },
    { key: "capacity", header: "Capacité", render: p => p.studentCount },
  ]

  return (
    <>
      <PageHeader
        title="Gestion des Promotions"
        subtitle="Créez et gérez les promotions au sein de l'institution."
        action={
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nouvelle Promotion
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        rowKey={p => p.id}
        emptyTitle="Aucune promotion"
        emptyDescription="Commencez par ajouter une promotion."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle Promotion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la promotion</Label>
              <Input
                placeholder="ex: Premier Graduat"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>Année {n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input
                  type="number"
                  value={form.studentCount}
                  onChange={e => setForm(f => ({ ...f, studentCount: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Faculté</Label>
              <Select value={form.facultyId} onValueChange={v => setForm(f => ({ ...f, facultyId: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir une faculté..." /></SelectTrigger>
                <SelectContent>
                  {store.faculties.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.facultyId}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
