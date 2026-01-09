
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MissionVisionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function MissionVisionCard({ icon, title, description }: MissionVisionCardProps) {
  return (
    <Card className="flex flex-col items-center text-center p-8 space-y-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 glass dark:glass-card hover:-translate-y-1">
      <div className="p-4 glass-button dark:glass-button-dark rounded-full inline-flex">
        {icon}
      </div>
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-bold font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
