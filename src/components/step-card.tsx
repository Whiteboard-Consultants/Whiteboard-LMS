
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface StepCardProps {
  stepNumber: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  checklist: string[];
}

export function StepCard({ stepNumber, icon, title, description, checklist }: StepCardProps) {
  return (
    <Card className="p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                <span className="text-lg font-bold text-foreground">{stepNumber}</span>
            </div>
            <div className="p-3 bg-muted rounded-full">
                {icon}
            </div>
        </div>
        <CardHeader className="p-0 mb-2">
            <CardTitle className="text-xl font-bold font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
            <p className="text-muted-foreground mb-4">{description}</p>
            <ul className="space-y-2">
                {checklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
  );
}
