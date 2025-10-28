
"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

type SidebarContext = {
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  isMounted: boolean
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> 
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [openMobile, setOpenMobile] = React.useState(false)
    const { isMobile, isMounted } = useIsMobile();


    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        openMobile,
        setOpenMobile,
        isMobile: isMobile,
        isMounted,
      }),
      [openMobile, isMobile, isMounted]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
          <div
            className={cn(
              "group/sidebar-wrapper",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { openMobile, setOpenMobile } = useSidebar();
    
    return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn("shrink-0 rounded-md", className)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={cn("flex flex-col bg-primary text-primary-foreground")} ref={ref} {...props}>
            {children}
          </SheetContent>
        </Sheet>
      )
  }
)
Sidebar.displayName = "Sidebar"
