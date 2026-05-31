import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

export function MobileNavbar() {
  const { nav } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center border-t border-border bg-background/95 backdrop-blur px-2 pb-safe md:hidden overflow-x-auto no-scrollbar">
      <div className="flex w-full min-w-max items-center justify-around gap-1 px-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex min-w-[64px] flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <item.icon className="size-5" />
            <span className="truncate max-w-[70px] text-center">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
