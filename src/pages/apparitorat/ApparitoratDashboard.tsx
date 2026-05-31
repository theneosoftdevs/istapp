// src/pages/apparitorat/ApparitoratDashboard.tsx
import { Users, UserCheck, UserCog, UserX } from "lucide-react"
import { PageHeader } from "@/src/components/ui/PageHeader"
import { KPICard } from "@/src/components/ui/KPICard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader } from "@/src/components/ui/Loader"
import { DataTable, type Column } from "@/src/components/ui/DataTable"
import { StatusBadge } from "@/src/components/ui/StatusBadge"
import { InscriptionDialog } from "@/src/pages/apparitorat/InscriptionDialog"
import { usePageData } from "@/src/hooks/usePageData"
import type { Student } from "@/src/types"

interface PendingRow extends Student {
  facultyCode: string
  promotionName: string
}

export function ApparitoratDashboard() {
  const { data, loading } = usePageData((d) => {
    const counts = {
      total: d.students.length,
      active: d.students.filter((s) => s.status === "active").length,
      pending: d.students.filter((s) => s.status === "pending").length,
      suspended: d.students.filter((s) => s.status === "suspended").length,
    }
    const pending: PendingRow[] = d.students
      .filter((s) => s.status === "pending")
      .map((s) => ({
        ...s,
        facultyCode: d.faculties.find((f) => f.id === s.facultyId)?.code ?? "—",
        promotionName: d.promotions.find((p) => p.id === s.promotionId)?.name ?? "—",
      }))
    const byFaculty = d.faculties.map((f) => ({
      name: f.name,
      code: f.code,
      count: d.students.filter((s) => s.facultyId === f.id).length,
    }))
    return { counts, pending, byFaculty }
  })

  if (loading || !data) return <Loader fullHeight />

  const columns: Column<PendingRow>[] = [
    {
      key: "matricule",
      header: "Matricule",
      render: (s) => <span className="font-mono text-xs">{s.matricule}</span>,
    },
    {
      key: "name",
      header: "Étudiant",
      render: (s) => (
        <span className="font-medium text-foreground">
          {s.firstName} {s.lastName}
        </span>
      ),
    },
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
  ]

  return (
    <>
      <PageHeader
        title="Tableau de bord Apparitorat"
        subtitle="Suivi des inscriptions et des dossiers étudiants."
        action={<InscriptionDialog />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total étudiants" value={data.counts.total} icon={Users} colorClass="bg-chart-1/10 text-chart-1" />
        <KPICard title="Actifs" value={data.counts.active} icon={UserCheck} colorClass="bg-chart-2/10 text-chart-2" />
        <KPICard title="En attente" value={data.counts.pending} icon={UserCog} colorClass="bg-chart-3/15 text-chart-3" />
        <KPICard title="Suspendus" value={data.counts.suspended} icon={UserX} colorClass="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dossiers en attente</CardTitle>
            <CardDescription>Inscriptions à finaliser ou valider</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data.pending}
              rowKey={(s) => s.id}
              emptyTitle="Aucun dossier en attente"
              emptyDescription="Toutes les inscriptions sont à jour."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par faculté</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.byFaculty.map((f) => (
                <li key={f.code} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{f.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-sm font-semibold text-foreground">
                    {f.count}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
