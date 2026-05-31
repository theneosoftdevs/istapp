// src/lib/store.ts
import rawData from "@/src/data.json"
import type {
  AppData,
  Grade,
  Student,
  Teacher,
  Faculty,
  Promotion,
  Assignment,
  Submission,
  GradeAppeal,
  CourseResource,
  Notification,
  Role,
} from "@/src/types"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Clamp a numeric score to the 0–20 range. */
function clampScore(n: number): number {
  return Math.max(0, Math.min(20, Number.isFinite(n) ? n : 0))
}

// ─── State initialisation ─────────────────────────────────────────────────────
// All seed data lives in data.json — this function just defensively ensures
// every required array exists even if the JSON is extended incrementally.

function initState(): AppData {
  const raw = structuredClone(rawData) as unknown as AppData
  return {
    ...raw,
    teacherTitles:    raw.teacherTitles    ?? [],
    assignments:      raw.assignments      ?? [],
    submissions:      raw.submissions      ?? [],
    gradeAppeals:     raw.gradeAppeals     ?? [],
    courseResources:  raw.courseResources  ?? [],
    notifications:    raw.notifications    ?? [],
  }
}

let state: AppData = initState()

// ─── Subscription (useSyncExternalStore) ─────────────────────────────────────

type Listener = () => void
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l()
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState(): AppData {
  return state
}

// ─── Students ────────────────────────────────────────────────────────────────

export function addStudent(student: Student) {
  state = { ...state, students: [student, ...state.students] }
  emit()
}

export function nextStudentId(): string {
  const max = state.students.reduce((acc, s) => {
    const n = Number(s.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `s${max + 1}`
}

// ─── Grades ───────────────────────────────────────────────────────────────────

export function updateGradeStatus(id: string, status: Grade["status"]) {
  state = { ...state, grades: state.grades.map((g) => (g.id === id ? { ...g, status } : g)) }
  emit()
}

export function setGradeScore(id: string, rawScore: number) {
  const score = clampScore(rawScore)
  const grade   = state.grades.find((g) => g.id === id)
  const student = grade ? state.students.find((s) => s.id === grade.studentId) : undefined
  const course  = grade ? state.courses.find((c) => c.id === grade.courseId)   : undefined

  const notification: Notification = {
    id: uid("notif-"),
    type: "grade_modified",
    message: `Note modifiée — ${student ? `${student.firstName} ${student.lastName}` : "Étudiant"} · ${course?.name ?? "cours"} : ${score}/20`,
    targetRole: "secretariat_general",
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      gradeId:   id,
      studentId: grade?.studentId ?? "",
      courseId:  grade?.courseId  ?? "",
    },
  }

  state = {
    ...state,
    grades: state.grades.map((g) => (g.id === id ? { ...g, score } : g)),
    notifications: [notification, ...state.notifications],
  }
  emit()
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export function addTeacher(teacher: Teacher) {
  state = { ...state, teachers: [teacher, ...state.teachers] }
  emit()
}

export function nextTeacherId(): string {
  const max = state.teachers.reduce((acc, t) => {
    const n = Number(t.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `t${max + 1}`
}

export function nextTeacherMatricule(): string {
  const max = state.teachers.reduce((acc, t) => {
    const n = Number(t.matricule.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `ENS-${String(max + 1).padStart(3, "0")}`
}

// ─── Faculties & Promotions ───────────────────────────────────────────────────

export function addFaculty(faculty: Faculty) {
  state = { ...state, faculties: [faculty, ...state.faculties] }
  emit()
}

export function addPromotion(promotion: Promotion) {
  state = { ...state, promotions: [promotion, ...state.promotions] }
  emit()
}

export function nextFacultyId(): string {
  const max = state.faculties.reduce((acc, f) => {
    const n = Number(f.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `f${max + 1}`
}

export function nextPromotionId(): string {
  const max = state.promotions.reduce((acc, p) => {
    const n = Number(p.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `p${max + 1}`
}

// ─── Course–teacher assignment ────────────────────────────────────────────────

export function assignCourseToTeacher(courseId: string, teacherId: string) {
  const course      = state.courses.find((c) => c.id === courseId)
  const teacher     = state.teachers.find((t) => t.id === teacherId)
  const oldTeacherId = course?.teacherId

  const notification: Notification = {
    id: uid("notif-"),
    type: "course_assigned",
    message: `Cours attribué — "${course?.name ?? courseId}" → ${teacher ? `${teacher.firstName} ${teacher.lastName}` : "Enseignant"}`,
    targetRole: "secretariat_general",
    read: false,
    createdAt: new Date().toISOString(),
    metadata: { courseId, teacherId },
  }

  state = {
    ...state,
    courses: state.courses.map((c) => (c.id === courseId ? { ...c, teacherId } : c)),
    teachers: state.teachers.map((t) => {
      if (t.id === oldTeacherId && oldTeacherId !== teacherId) {
        return { ...t, courseIds: t.courseIds.filter((id) => id !== courseId) }
      }
      if (t.id === teacherId) {
        return {
          ...t,
          courseIds: t.courseIds.includes(courseId) ? t.courseIds : [...t.courseIds, courseId],
        }
      }
      return t
    }),
    notifications: [notification, ...state.notifications],
  }
  emit()
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export function addAssignment(assignment: Assignment) {
  state = { ...state, assignments: [assignment, ...state.assignments] }
  emit()
}

export function removeAssignment(id: string) {
  state = {
    ...state,
    assignments: state.assignments.filter((a) => a.id !== id),
    submissions: state.submissions.filter((s) => s.assignmentId !== id),
  }
  emit()
}

export function nextAssignmentId(): string {
  return uid("asgn-")
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function addSubmission(submission: Submission) {
  state = { ...state, submissions: [submission, ...state.submissions] }
  emit()
}

export function gradeSubmission(id: string, rawGrade: number, feedback: string) {
  const grade = clampScore(rawGrade)
  state = {
    ...state,
    submissions: state.submissions.map((s) => (s.id === id ? { ...s, grade, feedback } : s)),
  }
  emit()
}

export function nextSubmissionId(): string {
  return uid("sub-")
}

// ─── Grade Appeals ────────────────────────────────────────────────────────────

export function addGradeAppeal(appeal: GradeAppeal) {
  const notification: Notification = {
    id: uid("notif-"),
    type: "new_appeal",
    message: `Nouveau recours soumis — "${appeal.reason.substring(0, 60)}${appeal.reason.length > 60 ? "…" : ""}"`,
    targetRole: "secretariat_general",
    read: false,
    createdAt: new Date().toISOString(),
    metadata: { appealId: appeal.id, gradeId: appeal.gradeId },
  }
  state = {
    ...state,
    gradeAppeals: [appeal, ...state.gradeAppeals],
    notifications: [notification, ...state.notifications],
  }
  emit()
}

export function resolveGradeAppeal(
  id: string,
  status: "approved" | "rejected",
  response: string,
) {
  state = {
    ...state,
    gradeAppeals: state.gradeAppeals.map((a) => (a.id === id ? { ...a, status, response } : a)),
  }
  emit()
}

export function nextAppealId(): string {
  return uid("recours-")
}

// ─── Course Resources ─────────────────────────────────────────────────────────

export function addCourseResource(resource: CourseResource) {
  state = { ...state, courseResources: [resource, ...state.courseResources] }
  emit()
}

export function removeCourseResource(id: string) {
  state = { ...state, courseResources: state.courseResources.filter((r) => r.id !== id) }
  emit()
}

export function nextResourceId(): string {
  return uid("res-")
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function markNotificationRead(id: string) {
  state = {
    ...state,
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  }
  emit()
}

export function markAllNotificationsRead(role: Role) {
  state = {
    ...state,
    notifications: state.notifications.map((n) =>
      n.targetRole === role ? { ...n, read: true } : n,
    ),
  }
  emit()
}
