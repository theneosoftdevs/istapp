// src/pages/secretariat_general/SecretariatGeneralResults.tsx
import { useState } from "react"
import { BarChart3, Users, Award, TrendingUp } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { DataTable, type Column } from "@/src/components/ui/DataTable"
import { StatusBadge } from "@/src/components/ui/StatusBadge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/src/hooks/usePageData"
import type { Student } from "@/src/types"

interface StudentRow extends Student {
  promotionName: string
  facultyName: string
  gradeCount: number
  avg: number
}

function ScoreBadge({ avg }: { avg: number }) {
  if (avg <= 0) return <span className="text-xs text-muted-foreground">—</span>
  const cls =
    avg >= 14
      ? "text-success font-semibold"
      : avg >= 10
      ? "text-warning font-semibold"
      : "text-destructive font-semibold"
  return <span className={cls}>{avg.toFixed(1)}/20</span>
}

export function SecretariatGeneralResults() {
  const store = useStore()
  const [facultyFilter, setFacultyFilter] = useState("all")
  const [promotionFilter, setPromotionFilter] = useState("all")

  const activeStudents = store.students.filter((s) => s.status === "active")
  const withGrades = store.students.filter((s) => s.average > 0)
  const overallAvg =
    withGrades.length > 0
      ? withGrades.reduce((acc, s) => acc + s.average, 0) / withGrades.length
      : 0
  const succeeding = withGrades.filter((s) => s.average >= 10).length

  const rows: StudentRow[] = store.students.map((s) => {
    const promotion = store.promotions.find((p) => p.id === s.promotionId)
    const faculty = store.faculties.find((f) => f.id === s.facultyId)
    const gradeCount = store.grades.filter(
      (g) => g.studentId === s.id && g.status === "validated",
    ).length
    return {
      ...s,
      promotionName: promotion?.name ?? "—",
      facultyName: faculty?.name ?? "—",
      gradeCount,
      avg: s.average,
    }
  })

  const filteredPromotions =
    facultyFilter === "all"
      ? store.promotions
      : store.promotions.filter((p) => p.facultyId === facultyFilter)

  const filtered = rows
    .filter((r) => facultyFilter === "all" || r.facultyId === facultyFilter)
    .filter((r) => promotionFilter === "all" || r.promotionId === promotionFilter)

  const columns: Column<StudentRow>[] = [
    {
      key: "name",
      header: "Étudiant",
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {s.firstName} {s.lastName}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{s.matricule}</p>
        </div>
      ),
    },
    {
      key: "promotion",
      header: "Promotion",
      render: (s) => (
        <div>
          <p className="text-sm text-foreground">{s.promotionName}</p>
          <p className="text-xs text-muted-foreground">{s.facultyName}</p>
        </div>
      ),
    },
    {
      key: "grades",
      header: "Notes validées",
      align: "center",
      render: (s) => (
        <span className="text-sm text-muted-foreground">{s.gradeCount}</span>
      ),
    },
    {
      key: "avg",
      header: "Moyenne",
      align: "center",
      render: (s) => <ScoreBadge avg={s.avg} />,
    },
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
  ]

  return (
    <>
      <PageHeader
        title="Résultats des étudiants"
        subtitle="Consultez les résultats académiques de tous les étudiants inscrits."
        action={
          <div className="flex gap-2">
            <Select
              value={facultyFilter}
              onValueChange={(v) => {
                setFacultyFilter(v)
                setPromotionFilter("all")
              }}
            >
              <SelectTrigger className="w-48">
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
            <Select value={promotionFilter} onValueChange={setPromotionFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Toutes les promotions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les promotions</SelectItem>
                {filteredPromotions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Étudiants actifs"
          value={activeStudents.length}
          icon={Users}
          colorClass="bg-chart-1/10 text-chart-1"
        />
        <KPICard
          title="Affichés"
          value={filtered.length}
          icon={BarChart3}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <KPICard
          title="Moyenne générale"
          value={overallAvg > 0 ? `${overallAvg.toFixed(1)}/20` : "—"}
          icon={TrendingUp}
          colorClass="bg-chart-3/15 text-chart-3"
        />
        <KPICard
          title="En réussite (≥10)"
          value={succeeding}
          icon={Award}
          colorClass="bg-chart-4/10 text-chart-4"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        emptyTitle="Aucun étudiant"
        emptyDescription="Aucun étudiant ne correspond aux filtres sélectionnés."
      />
    </>
  )
}
