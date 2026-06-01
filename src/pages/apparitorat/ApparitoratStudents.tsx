// src/pages/apparitorat/ApparitoratStudents.tsx
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePageData } from "@/hooks/usePageData"
import type { Student } from "@/types"
import { toast } from "sonner"

interface StudentRow extends Student {
  facultyCode: string
  promotionName: string
}

export function ApparitoratStudents() {
  const [query, setQuery] = useState("")
  const [faculty, setFaculty] = useState("all")
  const [promotion, setPromotion] = useState("all")
  const [status, setStatus] = useState("all")

  const { data, loading } = usePageData((d) => {
    const students: StudentRow[] = d.students.map((s) => ({
      ...s,
      facultyCode: d.faculties.find((f) => f.id === s.facultyId)?.code ?? "—",
      promotionName: d.promotions.find((p) => p.id === s.promotionId)?.name ?? "—",
    }))
    return { students, faculties: d.faculties, promotions: d.promotions }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.students.filter((s) => {
      const matchQ =
        !q ||
        [s.firstName, s.lastName, s.matricule, s.email].join(" ").toLowerCase().includes(q)
      const matchF = faculty === "all" || s.facultyId === faculty
      const matchP = promotion === "all" || s.promotionId === promotion
      const matchS = status === "all" || s.status === status
      return matchQ && matchF && matchP && matchS
    })
  }, [data, query, faculty, promotion, status])

  const columns: Column<StudentRow>[] = [
    {
      key: "matricule",
      header: "Matricule",
      render: (s) => <span className="font-mono text-xs">{s.matricule}</span>,
    },
    {
      key: "name",
      header: "Étudiant",
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {s.firstName} {s.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Téléphone", render: (s) => s.phone },
    { key: "faculty", header: "Faculté", render: (s) => s.facultyCode },
    { key: "promotion", header: "Promotion", render: (s) => s.promotionName },
    {
      key: "status",
      header: "Statut",
      align: "right",
      render: (s) => (
        <div className="flex justify-end">
          <StatusBadge status={s.status} />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <Button variant="ghost" size="sm" onClick={() => toast.info(`Modification de ${s.firstName} ${s.lastName}`)}>
          Modifier
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Étudiants"
        subtitle="Annuaire complet des étudiants inscrits."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9"
            aria-label="Rechercher un étudiant"
          />
        </div>
        <Select value={faculty} onValueChange={(v) => { setFaculty(v); setPromotion("all") }}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Faculté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les facultés</SelectItem>
            {data?.faculties.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={promotion} onValueChange={setPromotion}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Promotion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les promotions</SelectItem>
            {data?.promotions
              .filter(p => faculty === "all" || p.facultyId === faculty)
              .map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-32">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle="Aucun étudiant trouvé"
        emptyDescription="Modifiez vos filtres pour afficher des résultats."
      />
    </>
  )
}
