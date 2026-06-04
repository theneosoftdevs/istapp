// src/pages/rectorat/RectoratResults.tsx
import { useMemo, useState } from "react"
import { Search, Download, Filter } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { Card, CardContent } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/ui/Loader"

export function RectoratResults() {
  const [facultyId, setFacultyId] = useState<string>("all")
  const [search, setSearch] = useState("")

  const { data, loading } = usePageData((d) => {
    const grades = d.grades.map(g => {
      const student = d.students.find(s => s.id === g.studentId)
      const course = d.courses.find(c => c.id === g.courseId)
      const faculty = d.faculties.find(f => f.id === student?.facultyId)
      return {
        ...g,
        studentName: student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu",
        matricule: student?.matricule ?? "—",
        courseName: course?.name ?? "Cours inconnu",
        facultyName: faculty?.code ?? "—",
        facultyId: student?.facultyId
      }
    })

    return {
      grades,
      faculties: d.faculties
    }
  })

  const filtered = useMemo(() => {
    if (!data) return []
    return data.grades.filter(g => {
      const matchesFaculty = facultyId === "all" || g.facultyId === facultyId
      const matchesSearch = !search ||
        g.studentName.toLowerCase().includes(search.toLowerCase()) ||
        g.matricule.toLowerCase().includes(search.toLowerCase()) ||
        g.courseName.toLowerCase().includes(search.toLowerCase())
      return matchesFaculty && matchesSearch
    })
  }, [data, facultyId, search])

  const columns: Column<any>[] = [
    {
      key: "student",
      header: "Étudiant",
      render: (row) => (
        <div>
          <p className="font-medium">{row.studentName}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.matricule}</p>
        </div>
      )
    },
    { key: "facultyName", header: "Fac." },
    { key: "courseName", header: "Cours" },
    {
      key: "score",
      header: "Note",
      align: "center",
      render: (row) => (
        <Badge variant={row.score >= 10 ? "secondary" : "destructive"}>
          {row.score}/20
        </Badge>
      )
    },
    {
      key: "session",
      header: "Session",
      render: (row) => <span className="text-xs">{row.session}</span>
    },
    {
      key: "status",
      header: "Statut",
      render: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.status === "validated" ? "Validé" : row.status}
        </Badge>
      )
    }
  ]

  if (loading || !data) return <Loader fullHeight />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Résultats Institutionnels"
        subtitle="Vue consolidée de toutes les performances académiques."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un étudiant ou un cours..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={facultyId} onValueChange={setFacultyId}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder="Faculté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les facultés</SelectItem>
                  {data.faculties.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={g => g.id}
        emptyTitle="Aucun résultat"
      />
    </div>
  )
}
