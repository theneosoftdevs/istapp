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
  UserPlus,
  ClipboardCheck,
  FolderOpen,
  UserSquare2,
  BarChart3,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import type { Role, PortalInfo } from "@/types"

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
    description: "Gestion des cours, ressources, travaux et notes.",
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
    description: "Coordination administrative, enseignants, résultats.",
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
    { label: "Accueil",      to: "/student/dashboard",    icon: LayoutDashboard },
    { label: "Horaire",      to: "/student/schedule",     icon: CalendarDays },
    { label: "Travaux",      to: "/student/assignments",  icon: ClipboardCheck },
    { label: "Notes",        to: "/student/grades",       icon: FileText },
    { label: "Ressources",   to: "/student/resources",    icon: FolderOpen },
  ],
  teacher: [
    { label: "Accueil",      to: "/teacher/dashboard",   icon: LayoutDashboard },
    { label: "Cours",        to: "/teacher/courses",     icon: BookOpen },
    { label: "Travaux",      to: "/teacher/assignments", icon: ClipboardCheck },
    { label: "Notes",        to: "/teacher/grades",      icon: FileText },
    { label: "Horaire",      to: "/teacher/schedule",    icon: CalendarDays },
  ],
  apparitorat: [
    { label: "Accueil",      to: "/apparitorat/dashboard",    icon: LayoutDashboard },
    { label: "Inscriptions", to: "/apparitorat/inscriptions", icon: UserPlus },
    { label: "Étudiants",    to: "/apparitorat/students",     icon: Users },
  ],
  secretariat_faculte: [
    { label: "Accueil",      to: "/secretariat_faculte/dashboard",  icon: LayoutDashboard },
    { label: "Promotions",   to: "/secretariat_faculte/promotions", icon: Users },
    { label: "Cours",        to: "/secretariat_faculte/courses",    icon: BookOpen },
  ],
  secretariat_general: [
    { label: "Accueil",      to: "/secretariat_general/dashboard", icon: LayoutDashboard },
    { label: "Facultés",     to: "/secretariat_general/faculties", icon: Building2 },
    { label: "Enseignants",  to: "/secretariat_general/teachers",  icon: UserSquare2 },
    { label: "Résultats",    to: "/secretariat_general/results",   icon: BarChart3 },
    { label: "Recours",      to: "/secretariat_general/recours",   icon: AlertCircle },
  ],
  rectorat: [
    { label: "Accueil",      to: "/rectorat/dashboard", icon: LayoutDashboard },
    { label: "Stats",        to: "/rectorat/stats",     icon: BarChart3 },
    { label: "Facultés",     to: "/rectorat/faculties", icon: Building2 },
  ],
}
