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

function uid(prefix: string) {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

let state: AppData = {
  ...(structuredClone(rawData) as unknown as Omit<
    AppData,
    "assignments" | "submissions" | "gradeAppeals" | "courseResources" | "notifications"
  >),
  assignments: [
    {
      id: "asgn-1",
      courseId: "c1",
      teacherId: "t1",
      title: "TP1 — Application CRUD en Node.js",
      description:
        "Réalisez une application CRUD complète avec Node.js et Express. Documentez vos endpoints REST.",
      dueDate: "2026-02-15",
      createdAt: "2026-01-20",
    },
    {
      id: "asgn-2",
      courseId: "c2",
      teacherId: "t1",
      title: "Modélisation BDD hospitalière",
      description:
        "Concevez le schéma entité-relation d'un système hospitalier, puis implémentez-le en SQL.",
      dueDate: "2026-02-10",
      createdAt: "2026-01-18",
    },
  ],
  submissions: [
    {
      id: "sub-1",
      assignmentId: "asgn-1",
      studentId: "s1",
      content:
        "Application réalisée avec Express 4 et MongoDB. Repo : https://github.com/aline/tp1-crud",
      submittedAt: "2026-02-12T10:30:00Z",
    },
  ],
  gradeAppeals: [],
  courseResources: [
    {
      id: "res-1",
      courseId: "c1",
      teacherId: "t1",
      title: "Cours 1 — Introduction à Node.js",
      type: "pdf",
      url: "https://drive.google.com/file/d/example1",
      createdAt: "2026-01-10",
    },
    {
      id: "res-2",
      courseId: "c1",
      teacherId: "t1",
      title: "Tutoriel React Hooks",
      type: "video",
      url: "https://www.youtube.com/watch?v=example",
      createdAt: "2026-01-12",
    },
    {
      id: "res-3",
      courseId: "c2",
      teacherId: "t1",
      title: "Exercices SQL avancés",
      type: "pdf",
      url: "https://drive.google.com/file/d/example2",
      createdAt: "2026-01-15",
    },
  ],
  notifications: [],
}

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

export function nextStudentId() {
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

export function setGradeScore(id: string, score: number) {
  const grade = state.grades.find((g) => g.id === id)
  const student = grade ? state.students.find((s) => s.id === grade.studentId) : null
  const course = grade ? state.courses.find((c) => c.id === grade.courseId) : null

  const notification: Notification = {
    id: uid("notif-"),
    type: "grade_modified",
    message: `Note modifiée : ${student ? `${student.firstName} ${student.lastName}` : "Étudiant"} — ${course?.name ?? "cours"} → ${score}/20`,
    targetRole: "secretariat_general",
    read: false,
    createdAt: new Date().toISOString(),
    metadata: {
      gradeId: id,
      studentId: grade?.studentId ?? "",
      courseId: grade?.courseId ?? "",
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

export function nextTeacherId() {
  const max = state.teachers.reduce((acc, t) => {
    const n = Number(t.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `t${max + 1}`
}

export function nextTeacherMatricule() {
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

export function nextFacultyId() {
  const max = state.faculties.reduce((acc, f) => {
    const n = Number(f.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `f${max + 1}`
}

export function nextPromotionId() {
  const max = state.promotions.reduce((acc, p) => {
    const n = Number(p.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `p${max + 1}`
}

// ─── Course Assignment ────────────────────────────────────────────────────────

export function assignCourseToTeacher(courseId: string, teacherId: string) {
  const course = state.courses.find((c) => c.id === courseId)
  const teacher = state.teachers.find((t) => t.id === teacherId)
  const oldTeacherId = course?.teacherId

  const notification: Notification = {
    id: uid("notif-"),
    type: "course_assigned",
    message: `Cours attribué : "${course?.name ?? courseId}" → ${teacher ? `${teacher.firstName} ${teacher.lastName}` : "Enseignant"}`,
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
          courseIds: t.courseIds.includes(courseId)
            ? t.courseIds
            : [...t.courseIds, courseId],
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

export function nextAssignmentId() {
  return uid("asgn-")
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function addSubmission(submission: Submission) {
  state = { ...state, submissions: [submission, ...state.submissions] }
  emit()
}

export function gradeSubmission(id: string, grade: number, feedback: string) {
  state = {
    ...state,
    submissions: state.submissions.map((s) =>
      s.id === id ? { ...s, grade, feedback } : s,
    ),
  }
  emit()
}

export function nextSubmissionId() {
  return uid("sub-")
}

// ─── Grade Appeals ────────────────────────────────────────────────────────────

export function addGradeAppeal(appeal: GradeAppeal) {
  const notification: Notification = {
    id: uid("notif-"),
    type: "new_appeal",
    message: `Nouveau recours — Note contestée par un étudiant : "${appeal.reason.substring(0, 60)}${appeal.reason.length > 60 ? "…" : ""}"`,
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
    gradeAppeals: state.gradeAppeals.map((a) =>
      a.id === id ? { ...a, status, response } : a,
    ),
  }
  emit()
}

export function nextAppealId() {
  return uid("recours-")
}

// ─── Course Resources ─────────────────────────────────────────────────────────

export function addCourseResource(resource: CourseResource) {
  state = { ...state, courseResources: [resource, ...state.courseResources] }
  emit()
}

export function removeCourseResource(id: string) {
  state = {
    ...state,
    courseResources: state.courseResources.filter((r) => r.id !== id),
  }
  emit()
}

export function nextResourceId() {
  return uid("res-")
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function markNotificationRead(id: string) {
  state = {
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    ),
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
