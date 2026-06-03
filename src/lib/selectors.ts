// src/lib/selectors.ts
import type { AppData, Student, Teacher, Course, ScheduleSlot, Grade, Announcement } from "../types"

/**
 * Enriches a student object with faculty code and promotion name.
 */
export function enrichStudent(d: AppData, student: Student) {
  return {
    ...student,
    facultyCode: d.faculties.find((f) => f.id === student.facultyId)?.code ?? "—",
    promotionName: d.promotions.find((p) => p.id === student.promotionId)?.name ?? "—",
  }
}

/**
 * Gets enriched students list.
 */
export function getEnrichedStudents(d: AppData) {
  return d.students.map(s => enrichStudent(d, s))
}

/**
 * Filters announcements by audience and sorts them by date.
 */
export function getAnnouncementsFor(d: AppData, audience: "student" | "teacher" | "all" | "global") {
  return d.announcements
    .filter((a) => a.audience === "all" || a.audience === audience)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Gets dashboard metrics for a teacher.
 */
export function getTeacherDashboardData(d: AppData, teacherId: string, todayDayName: string) {
  const teacher = d.teachers.find((t) => t.id === teacherId) ?? d.teachers[0]
  const courses = d.courses.filter((c) => c.teacherId === teacher.id)
  const promotionIds = new Set(courses.map((c) => c.promotionId))
  const students = d.students.filter((s) => promotionIds.has(s.promotionId))
  const courseIds = new Set(courses.map((c) => c.id))
  const pendingGrades = d.grades.filter(
    (g) => courseIds.has(g.courseId) && g.status === "pending",
  )
  const schedules = d.schedules.filter((s) => s.teacherId === teacher.id)
  const todaySlots = schedules.filter((s) => s.day === todayDayName)

  return { teacher, courses, students, pendingGrades, schedules, todaySlots }
}

/**
 * Gets dashboard metrics for a student.
 */
export function getStudentDashboardData(d: AppData, studentId: string) {
  const student = d.students.find((s) => s.id === studentId) ?? d.students[0]
  const courses = d.courses.filter((c) => c.promotionId === student.promotionId)
  const schedules = d.schedules.filter((s) => s.promotionId === student.promotionId)
  const grades = d.grades.filter((g) => g.studentId === student.id)
  const announcements = getAnnouncementsFor(d, "student")
  const validated = grades.filter((g) => g.status === "validated").length

  return { student, courses, schedules, announcements, grades, validated }
}

/**
 * Gets global stats for Apparitorat.
 */
export function getApparitoratStats(d: AppData) {
  const total = d.students.length
  const girls = d.students.filter((s) => s.gender === "F").length
  const boys = d.students.filter((s) => s.gender === "M").length
  const pending = d.students.filter((s) => s.status === "pending").length
  const totalMax = d.rooms.reduce((acc, r) => acc + r.capacity, 0)

  return { total, girls, boys, pending, totalMax }
}
