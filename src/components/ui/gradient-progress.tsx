
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface GradientProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    value: number;
}

const GradientProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  GradientProgressProps
>(({ className, value, ...props }, ref) => {
    
    const gradientStyle = {
        background: `linear-gradient(to right, #ef4444, #f59e0b, #22c55e)`,
    };
    
  return (
    <div className="flex items-center gap-2">
        <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)`, ...gradientStyle }}
        />
      </ProgressPrimitive.Root>
      <span className="text-xs font-semibold text-muted-foreground">{value}%</span>
    </div>
  )
})
GradientProgress.displayName = 'GradientProgress'

export { GradientProgress }
