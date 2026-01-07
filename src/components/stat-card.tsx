import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string | React.ReactNode;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  isAlert?: boolean;
  className?: string;
  gradient?: "blue" | "green" | "purple" | "amber" | "slate" | "indigo" | "primary" | "rose" | "cyan";
  glass?: boolean;
}

const gradientToVariant = {
  blue: 'blue',
  green: 'green',
  purple: 'purple',
  amber: 'orange',
  slate: 'default',
  indigo: 'indigo',
  primary: 'default',
  rose: 'pink',
  cyan: 'blue',
} as const;

export function StatCard({ title, value, icon, children, isAlert, className, gradient, glass }: StatCardProps) {
  const glassClasses = {
    blue: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    green: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    purple: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    amber: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    slate: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    indigo: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    primary: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    rose: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
    cyan: "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all",
  };

  const variant = glass ? 'default' : (gradient ? gradientToVariant[gradient as keyof typeof gradientToVariant] : 'default');
  const classesForGradient = glass ? glassClasses[gradient || 'primary'] : '';
  const alertClass = isAlert ? "border-orange-500/50 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/40 dark:to-orange-900/20 hover:shadow-md" : "";

  return (
    <Card variant={alertClass ? 'orange' : (variant as any)} className={cn(classesForGradient, alertClass, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium uppercase tracking-wider", glass ? "text-foreground/80" : "text-muted-foreground")}>{title}</CardTitle>
        <div className={cn("opacity-75", glass ? "text-foreground/70" : "text-primary")}>{icon}</div>
      </CardHeader>
      <CardContent>
        {value && <div className={cn("text-3xl font-bold mt-2", glass ? "text-foreground" : "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent dark:from-primary-foreground dark:to-primary-foreground/60")}>{value}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
