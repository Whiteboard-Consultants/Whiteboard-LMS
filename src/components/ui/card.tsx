import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
}

const cardVariants = {
  default: "bg-white/40 dark:bg-slate-900/40",
  blue: "bg-gradient-to-br from-blue-50/80 via-blue-50/70 to-cyan-50/60 dark:from-blue-950/40 dark:via-blue-950/35 dark:to-blue-900/25",
  purple: "bg-gradient-to-br from-purple-50/80 via-purple-50/70 to-fuchsia-50/60 dark:from-purple-950/40 dark:via-purple-950/35 dark:to-purple-900/25",
  green: "bg-gradient-to-br from-green-50/80 via-green-50/70 to-emerald-50/60 dark:from-green-950/40 dark:via-green-950/35 dark:to-green-900/25",
  orange: "bg-gradient-to-br from-orange-50/80 via-orange-50/70 to-amber-50/60 dark:from-orange-950/40 dark:via-orange-950/35 dark:to-orange-900/25",
  pink: "bg-gradient-to-br from-pink-50/80 via-pink-50/70 to-rose-50/60 dark:from-pink-950/40 dark:via-pink-950/35 dark:to-pink-900/25",
  indigo: "bg-gradient-to-br from-indigo-50/80 via-indigo-50/70 to-purple-50/60 dark:from-indigo-950/40 dark:via-indigo-950/35 dark:to-indigo-900/25",
};

const borderVariants = {
  default: "border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80",
  blue: "border-blue-200/80 dark:border-blue-800/50 hover:border-blue-300/90 dark:hover:border-blue-700/70",
  purple: "border-purple-200/80 dark:border-purple-800/50 hover:border-purple-300/90 dark:hover:border-purple-700/70",
  green: "border-green-200/80 dark:border-green-800/50 hover:border-green-300/90 dark:hover:border-green-700/70",
  orange: "border-orange-200/80 dark:border-orange-800/50 hover:border-orange-300/90 dark:hover:border-orange-700/70",
  pink: "border-pink-200/80 dark:border-pink-800/50 hover:border-pink-300/90 dark:hover:border-pink-700/70",
  indigo: "border-indigo-200/80 dark:border-indigo-800/50 hover:border-indigo-300/90 dark:hover:border-indigo-700/70",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border backdrop-blur-md text-card-foreground shadow-md hover:shadow-lg transition-all dark:!bg-slate-900 dark:!border-slate-800 flex flex-col",
        borderVariants[variant],
        cardVariants[variant],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 dark:bg-slate-900 rounded-t-xl", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground dark:text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 dark:bg-slate-900 flex-1 rounded-b-xl", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
