// src/App.tsx
import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { AppLayout } from "@/layouts/AppLayout"
import { LoginPage } from "@/pages/LoginPage"
import { NotificationsPage } from "@/pages/NotificationsPage"
import type { ReactNode } from "react"
import type { Role } from "@/types"

// ─── Étudiant ──────────────────────────────────────────────────────────────
import { StudentDashboard }   from "@/pages/student/StudentDashboard"
import { StudentSchedule }    from "@/pages/student/StudentSchedule"
import { StudentGrades }      from "@/pages/student/StudentGrades"
import { StudentAssignments } from "@/pages/student/StudentAssignments"
import { StudentResources }   from "@/pages/student/StudentResources"

// ─── Enseignant ───────────────────────────────────────────────────────────────
import { TeacherDashboard }   from "@/pages/teacher/TeacherDashboard"
import { TeacherCourses }     from "@/pages/teacher/TeacherCourses"
import { TeacherGrades }      from "@/pages/teacher/TeacherGrades"
import { TeacherSchedule }    from "@/pages/teacher/TeacherSchedule"
import { TeacherAssignments } from "@/pages/teacher/TeacherAssignments"

// ─── Apparitorat ──────────────────────────────────────────────────────────────
import { ApparitoratDashboard }   from "@/pages/apparitorat/ApparitoratDashboard"
import { ApparitoratInscriptions } from "@/pages/apparitorat/ApparitoratInscriptions"
import { ApparitoratStudents }    from "@/pages/apparitorat/ApparitoratStudents"
import { ApparitoratRooms }       from "@/pages/apparitorat/ApparitoratRooms"

// ─── Secrétariat Faculté ──────────────────────────────────────────────────────
import { FacultyDashboard }   from "@/pages/secretariat_faculte/FacultyDashboard"
import { FacultyPromotions }  from "@/pages/secretariat_faculte/FacultyPromotions"
import { FacultyCourses }     from "@/pages/secretariat_faculte/FacultyCourses"
import { FacultyRecours }     from "@/pages/secretariat_faculte/FacultyRecours"

// ─── Secrétariat Général ──────────────────────────────────────────────────────
import { SecretariatGeneralDashboard }     from "@/pages/secretariat_general/SecretariatGeneralDashboard"
import { SecretariatGeneralFaculties }     from "@/pages/secretariat_general/SecretariatGeneralFaculties"
import { SecretariatGeneralPromotions }    from "@/pages/secretariat_general/SecretariatGeneralPromotions"
import { SecretariatGeneralTeachers }      from "@/pages/secretariat_general/SecretariatGeneralTeachers"
import { SecretariatGeneralResults }       from "@/pages/secretariat_general/SecretariatGeneralResults"
import { SecretariatGeneralRecours }       from "@/pages/secretariat_general/SecretariatGeneralRecours"

// ─── Rectorat ─────────────────────────────────────────────────────────────────
import { RectoratDashboard } from "@/pages/rectorat/RectoratDashboard"
import { RectoratStats }     from "@/pages/rectorat/RectoratStats"
import { RectoratFaculties } from "@/pages/rectorat/RectoratFaculties"

// ─── Guards ───────────────────────────────────────────────────────────────────

/** Redirects unauthenticated users to /login. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/**
 * Role-based access guard — renders <Outlet /> for the expected role,
 * redirects elsewhere for any other authenticated user.
 */
function RoleGuard({ allow }: { allow: Role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== allow) return <Navigate to={`/${user.role}/dashboard`} replace />
  return <Outlet />
}

/** Redirects to the correct portal dashboard after login. */
function RoleRedirect() {
  const { role, isAuthenticated } = useAuth()
  if (!isAuthenticated || !role) return <Navigate to="/login" replace />
  return <Navigate to={`/${role}/dashboard`} replace />
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/"      element={<RoleRedirect />} />

      {/* All protected routes share the AppLayout shell */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        
        {/* Unified Communications Center */}
        <Route path="/communications" element={<NotificationsPage />} />

        {/* Étudiant */}
        <Route element={<RoleGuard allow="student" />}>
          <Route path="/student/dashboard"    element={<StudentDashboard />} />
          <Route path="/student/schedule"     element={<StudentSchedule />} />
          <Route path="/student/grades"       element={<StudentGrades />} />
          <Route path="/student/assignments"  element={<StudentAssignments />} />
          <Route path="/student/resources"    element={<StudentResources />} />
          <Route path="/student/announcements" element={<Navigate to="/communications" replace />} />
        </Route>

        {/* Enseignant */}
        <Route element={<RoleGuard allow="teacher" />}>
          <Route path="/teacher/dashboard"   element={<TeacherDashboard />} />
          <Route path="/teacher/courses"     element={<TeacherCourses />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/grades"      element={<TeacherGrades />} />
          <Route path="/teacher/schedule"    element={<TeacherSchedule />} />
        </Route>

        {/* Apparitorat */}
        <Route element={<RoleGuard allow="apparitorat" />}>
          <Route path="/apparitorat/dashboard"    element={<ApparitoratDashboard />} />
          <Route path="/apparitorat/inscriptions" element={<ApparitoratInscriptions />} />
          <Route path="/apparitorat/students"     element={<ApparitoratStudents />} />
          <Route path="/apparitorat/rooms"        element={<ApparitoratRooms />} />
        </Route>

        {/* Secrétariat Faculté */}
        <Route element={<RoleGuard allow="secretariat_faculte" />}>
          <Route path="/secretariat_faculte/dashboard"  element={<FacultyDashboard />} />
          <Route path="/secretariat_faculte/promotions" element={<FacultyPromotions />} />
          <Route path="/secretariat_faculte/courses"    element={<FacultyCourses />} />
          <Route path="/secretariat_faculte/recours"     element={<FacultyRecours />} />
        </Route>

        {/* Secrétariat Général */}
        <Route element={<RoleGuard allow="secretariat_general" />}>
          <Route path="/secretariat_general/dashboard"     element={<SecretariatGeneralDashboard />} />
          <Route path="/secretariat_general/faculties"     element={<SecretariatGeneralFaculties />} />
          <Route path="/secretariat_general/promotions"    element={<SecretariatGeneralPromotions />} />
          <Route path="/secretariat_general/teachers"      element={<SecretariatGeneralTeachers />} />
          <Route path="/secretariat_general/results"       element={<SecretariatGeneralResults />} />
          <Route path="/secretariat_general/recours"       element={<SecretariatGeneralRecours />} />
          <Route path="/secretariat_general/notifications" element={<Navigate to="/communications" replace />} />
          <Route path="/secretariat_general/announcements" element={<Navigate to="/communications" replace />} />
        </Route>

        {/* Rectorat */}
        <Route element={<RoleGuard allow="rectorat" />}>
          <Route path="/rectorat/dashboard" element={<RectoratDashboard />} />
          <Route path="/rectorat/stats"     element={<RectoratStats />} />
          <Route path="/rectorat/faculties" element={<RectoratFaculties />} />
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
