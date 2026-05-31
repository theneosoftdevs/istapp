// src/lib/store.ts
import rawData from "@/src/data.json"
import type { AppData, Grade, Student } from "@/src/types"

// In-memory mutable copy so that mutations (e.g. new inscriptions) persist
// for the lifetime of the session while keeping data.json as the source seed.
let state: AppData = structuredClone(rawData) as AppData

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

export function addStudent(student: Student) {
  state = {
    ...state,
    students: [student, ...state.students],
  }
  emit()
}

export function updateGradeStatus(id: string, status: Grade["status"]) {
  state = {
    ...state,
    grades: state.grades.map((g) => (g.id === id ? { ...g, status } : g)),
  }
  emit()
}

export function setGradeScore(id: string, score: number) {
  state = {
    ...state,
    grades: state.grades.map((g) => (g.id === id ? { ...g, score } : g)),
  }
  emit()
}

export function nextStudentId() {
  const max = state.students.reduce((acc, s) => {
    const n = Number(s.id.replace(/\D/g, ""))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `s${max + 1}`
}
