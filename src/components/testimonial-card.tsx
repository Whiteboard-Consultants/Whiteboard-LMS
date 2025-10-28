
import { Star } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export interface TestimonialProps {
  name: string;
  university: string;
  quote: string;
}

export function TestimonialCard({ name, university, quote }: TestimonialProps) {
  return (
    <Card className="flex flex-col p-6 bg-background dark:bg-black h-full">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
            <Star
            key={i}
            className="h-5 w-5 text-amber-400 fill-amber-400"
            />
        ))}
      </div>
      <CardContent className="p-0 mb-6 flex-1">
        <p className="text-muted-foreground italic">&quot;{quote}&quot;</p>
      </CardContent>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{university}</p>
      </div>
    </Card>
  );
}
