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
  level: string
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
  title: string
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
  start: string
  end: string
  room: string
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  promotionId: string
  score: number
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

export interface Assignment {
  id: string
  courseId: string
  teacherId: string
  title: string
  description: string
  dueDate: string
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  submittedAt: string
  grade?: number
  feedback?: string
}

export interface GradeAppeal {
  id: string
  studentId: string
  courseId: string
  gradeId: string
  reason: string
  status: "pending" | "approved" | "rejected"
  response?: string
  createdAt: string
}

export interface CourseResource {
  id: string
  courseId: string
  teacherId: string
  title: string
  type: "pdf" | "video" | "link" | "doc"
  url: string
  createdAt: string
}

export interface Notification {
  id: string
  type: "grade_modified" | "new_appeal" | "appeal_resolved" | "course_assigned"
  message: string
  targetRole: Role
  read: boolean
  createdAt: string
  metadata?: Record<string, string>
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
  assignments: Assignment[]
  submissions: Submission[]
  gradeAppeals: GradeAppeal[]
  courseResources: CourseResource[]
  notifications: Notification[]
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
