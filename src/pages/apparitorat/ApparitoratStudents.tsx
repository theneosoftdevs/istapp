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
import locales from "@/lib/locales.json"

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
      header: locales.apparitorat.matricule,
      render: (s) => <span className="font-mono text-xs">{s.matricule}</span>,
    },
    {
      key: "name",
      header: locales.apparitorat.student_label,
      render: (s) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">
            {s.firstName} {s.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    { key: "phone", header: locales.apparitorat.phone_label, render: (s) => s.phone },
    { key: "faculty", header: locales.apparitorat.faculty, render: (s) => s.facultyCode },
    { key: "promotion", header: locales.apparitorat.promotion, render: (s) => s.promotionName },
    {
      key: "status",
      header: locales.apparitorat.status,
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
        <Button variant="ghost" size="sm" onClick={() => toast.info(`${locales.apparitorat.modifying_toast} ${s.firstName} ${s.lastName}`)}>
          {locales.apparitorat.modify_button}
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={locales.apparitorat.students_title}
        subtitle={locales.apparitorat.students_subtitle}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locales.apparitorat.search_placeholder}
            className="pl-9"
            aria-label={locales.apparitorat.search_aria}
          />
        </div>
        <Select value={faculty} onValueChange={(v) => { setFaculty(v); setPromotion("all") }}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder={locales.apparitorat.faculty} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locales.apparitorat.all_faculties}</SelectItem>
            {data?.faculties.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={promotion} onValueChange={setPromotion}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder={locales.apparitorat.promotion} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locales.apparitorat.all_promotions}</SelectItem>
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
            <SelectValue placeholder={locales.apparitorat.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locales.apparitorat.all_status}</SelectItem>
            <SelectItem value="active">{locales.apparitorat.status_active}</SelectItem>
            <SelectItem value="pending">{locales.apparitorat.status_pending}</SelectItem>
            <SelectItem value="suspended">{locales.apparitorat.status_suspended}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle={locales.apparitorat.no_student_found}
        emptyDescription={locales.apparitorat.no_student_found_desc}
      />
    </>
  )
}
