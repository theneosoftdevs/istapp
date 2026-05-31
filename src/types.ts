// src/types.ts

export type Role =
  | "student"
  | "teacher"
  | "apparitorat"
  | "secretariat_faculte"
  | "secretariat_general"
  | "rectorat"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  /** linked entity id (student/teacher) when applicable */
  refId?: string
}

export interface Faculty {
  id: string
  name: string
  code: string
  dean: string
  studentCount: number
}

export interface Promotion {
  id: string
  name: string
  facultyId: string
  level: string // L1, L2, L3, M1, M2
  studentCount: number
}

export interface Student {
  id: string
  matricule: string
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: "M" | "F"
  promotionId: string
  facultyId: string
  status: "active" | "pending" | "suspended"
  enrollmentDate: string
  average: number
}

export interface Teacher {
  id: string
  matricule: string
  firstName: string
  lastName: string
  email: string
  phone: string
  facultyId: string
  title: string // Professeur, Assistant, etc.
  courseIds: string[]
  status: "active" | "pending"
}

export interface Course {
  id: string
  code: string
  name: string
  credits: number
  facultyId: string
  promotionId: string
  teacherId: string
  hours: number
}

export interface ScheduleSlot {
  id: string
  courseId: string
  promotionId: string
  teacherId: string
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi"
  start: string // HH:mm
  end: string // HH:mm
  room: string
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  promotionId: string
  score: number // /20
  status: "validated" | "pending" | "rejected"
  session: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  author: string
  date: string
  audience: Role | "all"
  priority: "info" | "important" | "urgent"
}

export interface AppData {
  users: User[]
  faculties: Faculty[]
  promotions: Promotion[]
  students: Student[]
  teachers: Teacher[]
  courses: Course[]
  schedules: ScheduleSlot[]
  grades: Grade[]
  announcements: Announcement[]
}

export type StatusValue =
  | "active"
  | "pending"
  | "validated"
  | "suspended"
  | "rejected"
  | "info"
  | "important"
  | "urgent"

export interface PortalInfo {
  role: Role
  label: string
  description: string
}
