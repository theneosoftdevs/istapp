// src/lib/portals.ts
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  Building2,
  Landmark,
  ShieldCheck,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Megaphone,
  UserPlus,
  type LucideIcon,
} from "lucide-react"
import type { Role, PortalInfo } from "@/src/types"

export const PORTALS: (PortalInfo & { icon: LucideIcon; color: string })[] = [
  {
    role: "student",
    label: "Étudiant",
    description: "Cours, notes, emploi du temps et annonces.",
    icon: GraduationCap,
    color: "text-chart-1",
  },
  {
    role: "teacher",
    label: "Enseignant",
    description: "Gestion des cours, notes et plannings.",
    icon: BookOpen,
    color: "text-chart-2",
  },
  {
    role: "apparitorat",
    label: "Apparitorat",
    description: "Inscriptions et suivi des étudiants.",
    icon: ClipboardList,
    color: "text-chart-3",
  },
  {
    role: "secretariat_faculte",
    label: "Secrétariat Faculté",
    description: "Gestion académique de la faculté.",
    icon: Building2,
    color: "text-chart-4",
  },
  {
    role: "secretariat_general",
    label: "Secrétariat Général",
    description: "Coordination administrative générale.",
    icon: Landmark,
    color: "text-chart-5",
  },
  {
    role: "rectorat",
    label: "Rectorat",
    description: "Pilotage et statistiques de l'institution.",
    icon: ShieldCheck,
    color: "text-primary",
  },
]

export function getPortal(role: Role) {
  return PORTALS.find((p) => p.role === role)
}

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { label: "Tableau de bord", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "Mon emploi du temps", to: "/student/schedule", icon: CalendarDays },
    { label: "Mes notes", to: "/student/grades", icon: FileText },
    { label: "Annonces", to: "/student/announcements", icon: Megaphone },
  ],
  teacher: [
    { label: "Tableau de bord", to: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Mes cours", to: "/teacher/courses", icon: BookOpen },
    { label: "Saisie des notes", to: "/teacher/grades", icon: FileText },
    { label: "Emploi du temps", to: "/teacher/schedule", icon: CalendarDays },
  ],
  apparitorat: [
    { label: "Tableau de bord", to: "/apparitorat/dashboard", icon: LayoutDashboard },
    { label: "Inscriptions", to: "/apparitorat/inscriptions", icon: UserPlus },
    { label: "Étudiants", to: "/apparitorat/students", icon: Users },
  ],
  secretariat_faculte: [
    { label: "Tableau de bord", to: "/secretariat_faculte/dashboard", icon: LayoutDashboard },
    { label: "Promotions", to: "/secretariat_faculte/promotions", icon: Users },
    { label: "Cours", to: "/secretariat_faculte/courses", icon: BookOpen },
  ],
  secretariat_general: [
    { label: "Tableau de bord", to: "/secretariat_general/dashboard", icon: LayoutDashboard },
    { label: "Facultés", to: "/secretariat_general/faculties", icon: Building2 },
    { label: "Annonces", to: "/secretariat_general/announcements", icon: Megaphone },
  ],
  rectorat: [
    { label: "Tableau de bord", to: "/rectorat/dashboard", icon: LayoutDashboard },
    { label: "Statistiques", to: "/rectorat/stats", icon: LayoutDashboard },
    { label: "Facultés", to: "/rectorat/faculties", icon: Building2 },
  ],
}
