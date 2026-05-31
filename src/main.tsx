// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "@/src/App"
import { AuthProvider } from "@/src/contexts/AuthContext"
import { AppProvider } from "@/src/contexts/AppContext"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/src/components/ErrorBoundary"
import "@/src/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppProvider>
            <App />
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
