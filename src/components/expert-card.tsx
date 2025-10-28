
import Image from "next/image";
import Link from "next/link";
import { Linkedin, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";

interface ExpertCardProps {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  linkedinUrl: string;
  dataAiHint?: string;
}

export function ExpertCard({ name, title, description, imageUrl, linkedinUrl, dataAiHint }: ExpertCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:bg-black">
      <CardHeader className="p-0">
        <div className="relative h-64 w-full">
          {imageUrl && imageUrl.trim() !== '' ? (
            <Image
              src={imageUrl}
              alt={`Portrait of ${name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={dataAiHint}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Expert Photo</p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6 space-y-2">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="font-semibold text-primary">{title}</CardDescription>
        <p className="text-muted-foreground text-sm flex-1 pt-2">{description}</p>
      </CardContent>
      <CardFooter className="justify-center p-6 pt-0">
        <Button asChild variant="ghost" size="icon">
          <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary" />
            <span className="sr-only">LinkedIn Profile</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
