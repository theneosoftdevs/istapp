// src/contexts/AuthContext.tsx
import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"
import rawData from "@/data.json"
import { normalizeUser } from "@/lib/utils"
import type { AppData, Role, User } from "@/types"

const data = rawData as AppData
const STORAGE_KEY = "ista-role"

interface AuthContextValue {
  user: User | null
  role: Role | null
  isAuthenticated: boolean
  login: (role: Role) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function userForRole(role: Role): User {
  const existing = data.users.find((u) => u.role === role)
  if (existing) {
    return normalizeUser(existing) as User
  }
  return {
    id: `tmp-${role}`,
    firstName: "Utilisateur",
    lastName: "",
    email: "",
    role
  }
}

function readStoredRole(): Role | null {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(STORAGE_KEY) as Role | null
  return stored
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => readStoredRole())

  const login = useCallbackSafe((nextRole: Role) => {
    window.localStorage.setItem(STORAGE_KEY, nextRole)
    setRole(nextRole)
  })

  const logout = useCallbackSafe(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setRole(null)
  })

  const value = useMemo<AuthContextValue>(() => {
    return {
      role,
      user: role ? userForRole(role) : null,
      isAuthenticated: role !== null,
      login,
      logout,
    }
  }, [role, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Small helper to avoid relying on a non-existent React export name.
function useCallbackSafe<T extends (...args: any[]) => any>(fn: T): T {
  return useCallback(fn, []) as T
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider")
  return ctx
}
