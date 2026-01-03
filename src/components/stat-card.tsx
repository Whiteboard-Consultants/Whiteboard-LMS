import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string | React.ReactNode;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  isAlert?: boolean;
  className?: string;
  gradient?: "blue" | "green" | "purple" | "amber" | "slate" | "indigo";
}

export function StatCard({ title, value, icon, children, isAlert, className, gradient }: StatCardProps) {
  const gradientClasses = {
    blue: "bg-gradient-to-br from-blue-50 dark:from-blue-900/20 border-blue-200 dark:border-blue-800",
    green: "bg-gradient-to-br from-green-50 dark:from-green-900/20 border-green-200 dark:border-green-800",
    purple: "bg-gradient-to-br from-purple-50 dark:from-purple-900/20 border-purple-200 dark:border-purple-800",
    amber: "bg-gradient-to-br from-amber-50 dark:from-amber-900/20 border-amber-200 dark:border-amber-800",
    slate: "bg-gradient-to-br from-slate-50 dark:from-slate-900/20 border-slate-200 dark:border-slate-800",
    indigo: "bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  };

  const gradientClass = gradient ? gradientClasses[gradient] : "";
  const alertClass = isAlert ? "border-orange-500/50 bg-orange-50 dark:bg-orange-900/20" : "";

  return (
    <Card className={cn(alertClass || gradientClass, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value && <div className="text-2xl font-bold">{value}</div>}
        {children}
      </CardContent>
    </Card>
  );
}
