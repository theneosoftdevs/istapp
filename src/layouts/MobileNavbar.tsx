import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

export function MobileNavbar() {
  const { nav } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center border-t border-border bg-background/95 backdrop-blur px-2 pb-safe md:hidden overflow-x-auto no-scrollbar">
      <div className="flex w-full min-w-max items-center justify-around gap-1 px-2">
        {nav.map((item, index) => {
          // Highlight the middle item if there are 5 items (Student/Teacher "Travaux")
          const isMiddle = nav.length === 5 && index === 2

          if (isMiddle) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "relative -top-3 flex flex-col items-center gap-1 transition-transform active:scale-95",
                  )
                }
              >
                <div className={cn(
                  "flex size-14 items-center justify-center rounded-full border-4 border-background shadow-lg transition-colors",
                  "bg-primary text-primary-foreground"
                )}>
                  <item.icon className="size-6" />
                </div>
                <span className="absolute -bottom-5 truncate max-w-[70px] text-center text-[10px] font-bold text-primary">
                  {item.label}
                </span>
              </NavLink>
            )
          }

          return (
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
          )
        })}
      </div>
    </nav>
  )
}
