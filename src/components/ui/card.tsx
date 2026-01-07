import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo';
}

const cardVariants = {
  default: "bg-white/40 dark:bg-slate-900/40",
  blue: "bg-gradient-to-br from-blue-50/60 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/20",
  purple: "bg-gradient-to-br from-purple-50/60 to-purple-100/40 dark:from-purple-950/30 dark:to-purple-900/20",
  green: "bg-gradient-to-br from-green-50/60 to-green-100/40 dark:from-green-950/30 dark:to-green-900/20",
  orange: "bg-gradient-to-br from-orange-50/60 to-orange-100/40 dark:from-orange-950/30 dark:to-orange-900/20",
  pink: "bg-gradient-to-br from-pink-50/60 to-pink-100/40 dark:from-pink-950/30 dark:to-pink-900/20",
  indigo: "bg-gradient-to-br from-indigo-50/60 to-indigo-100/40 dark:from-indigo-950/30 dark:to-indigo-900/20",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border backdrop-blur-md border-white/60 dark:border-slate-700/60 text-card-foreground shadow-md hover:shadow-lg hover:border-white/80 dark:hover:border-slate-600/80 transition-all",
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
    className={cn("flex flex-col space-y-1.5 p-6", className)}
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
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
