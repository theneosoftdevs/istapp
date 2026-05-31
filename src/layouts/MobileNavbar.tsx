import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"

export function MobileNavbar() {
  const { nav } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center border-t border-border bg-background/95 backdrop-blur px-2 pb-safe md:hidden overflow-visible">
      <div className="flex w-full items-center justify-around gap-1 px-2">
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
                    "relative -top-5 flex flex-col items-center gap-1 transition-transform active:scale-95 z-10",
                  )
                }
              >
                <div className={cn(
                  "flex size-14 items-center justify-center rounded-full border-[6px] border-background shadow-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <item.icon className="size-6" />
                </div>
                <span className={cn(
                  "absolute -bottom-5 truncate max-w-[70px] text-center text-[10px] font-bold",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
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
                  "flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <item.icon className="size-5" />
              <span className="truncate max-w-[64px] text-center">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
