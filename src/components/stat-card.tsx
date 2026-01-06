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

export function StatCard({ title, value, icon, children, isAlert, className, gradient, glass }: StatCardProps) {
  const gradientClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all",
    green: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20 border-green-200/50 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all",
    slate: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950/40 dark:to-slate-900/20 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/30 dark:to-primary/15 border-primary/30 dark:border-primary/40 hover:border-primary/50 dark:hover:border-primary/60 hover:shadow-md transition-all",
    rose: "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-rose-900/20 border-rose-200/50 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all",
    cyan: "bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/40 dark:to-cyan-900/20 border-cyan-200/50 dark:border-cyan-800/50 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md transition-all",
  };

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

  const gradientClass = glass ? glassClasses[gradient || 'primary'] : (gradient ? gradientClasses[gradient] : gradientClasses.primary);
  const alertClass = isAlert ? "border-orange-500/50 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/40 dark:to-orange-900/20 hover:shadow-md" : "";

  return (
    <Card className={cn("border transition-all", alertClass || gradientClass, glass && "shadow-xl", className)}>
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
