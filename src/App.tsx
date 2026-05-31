// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "@/src/contexts/AuthContext"
import { AppLayout } from "@/src/layouts/AppLayout"
import { LoginPage } from "@/src/pages/LoginPage"

// Étudiant
import { StudentDashboard } from "@/src/pages/student/StudentDashboard"
import { StudentSchedule } from "@/src/pages/student/StudentSchedule"
import { StudentGrades } from "@/src/pages/student/StudentGrades"
import { StudentAnnouncements } from "@/src/pages/student/StudentAnnouncements"

// Enseignant
import { TeacherDashboard } from "@/src/pages/teacher/TeacherDashboard"
import { TeacherCourses } from "@/src/pages/teacher/TeacherCourses"
import { TeacherGrades } from "@/src/pages/teacher/TeacherGrades"
import { TeacherSchedule } from "@/src/pages/teacher/TeacherSchedule"

// Apparitorat
import { ApparitoratDashboard } from "@/src/pages/apparitorat/ApparitoratDashboard"
import { ApparitoratInscriptions } from "@/src/pages/apparitorat/ApparitoratInscriptions"
import { ApparitoratStudents } from "@/src/pages/apparitorat/ApparitoratStudents"

// Secrétariat Faculté
import { FacultyDashboard } from "@/src/pages/secretariat_faculte/FacultyDashboard"
import { FacultyPromotions } from "@/src/pages/secretariat_faculte/FacultyPromotions"
import { FacultyCourses } from "@/src/pages/secretariat_faculte/FacultyCourses"

// Secrétariat Général
import { SecretariatGeneralDashboard } from "@/src/pages/secretariat_general/SecretariatGeneralDashboard"
import { SecretariatGeneralFaculties } from "@/src/pages/secretariat_general/SecretariatGeneralFaculties"
import { SecretariatGeneralAnnouncements } from "@/src/pages/secretariat_general/SecretariatGeneralAnnouncements"

// Rectorat
import { RectoratDashboard } from "@/src/pages/rectorat/RectoratDashboard"
import { RectoratStats } from "@/src/pages/rectorat/RectoratStats"
import { RectoratFaculties } from "@/src/pages/rectorat/RectoratFaculties"

import type { ReactNode } from "react"

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRedirect() {
  const { role, isAuthenticated } = useAuth()
  if (!isAuthenticated || !role) return <Navigate to="/login" replace />
  return <Navigate to={`/${role}/dashboard`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* Étudiant */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />

        {/* Enseignant */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/grades" element={<TeacherGrades />} />
        <Route path="/teacher/schedule" element={<TeacherSchedule />} />

        {/* Apparitorat */}
        <Route path="/apparitorat/dashboard" element={<ApparitoratDashboard />} />
        <Route path="/apparitorat/inscriptions" element={<ApparitoratInscriptions />} />
        <Route path="/apparitorat/students" element={<ApparitoratStudents />} />

        {/* Secrétariat Faculté */}
        <Route path="/secretariat_faculte/dashboard" element={<FacultyDashboard />} />
        <Route path="/secretariat_faculte/promotions" element={<FacultyPromotions />} />
        <Route path="/secretariat_faculte/courses" element={<FacultyCourses />} />

        {/* Secrétariat Général */}
        <Route path="/secretariat_general/dashboard" element={<SecretariatGeneralDashboard />} />
        <Route path="/secretariat_general/faculties" element={<SecretariatGeneralFaculties />} />
        <Route path="/secretariat_general/announcements" element={<SecretariatGeneralAnnouncements />} />

        {/* Rectorat */}
        <Route path="/rectorat/dashboard" element={<RectoratDashboard />} />
        <Route path="/rectorat/stats" element={<RectoratStats />} />
        <Route path="/rectorat/faculties" element={<RectoratFaculties />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
