import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string | React.ReactNode;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  isAlert?: boolean;
}

export function StatCard({ title, value, icon, children, isAlert }: StatCardProps) {
  return (
    <Card className={cn(isAlert && "border-orange-500/50 bg-orange-50 dark:bg-orange-900/20")}>
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
