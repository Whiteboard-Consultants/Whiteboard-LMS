
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, BookOpenCheck, FilePenLine, FileText, University, Briefcase, Languages, Users, type LucideProps } from "lucide-react";
import React from "react";

export type IconName = "Globe" | "BookOpenCheck" | "FilePenLine" | "FileText" | "University" | "Briefcase" | "Languages" | "Users";

const icons: Record<IconName, React.ComponentType<LucideProps>> = {
  Globe,
  BookOpenCheck,
  FilePenLine,
  FileText,
  University,
  Briefcase,
  Languages,
  Users,
};

const iconColors: Record<IconName, string> = {
    Globe: "text-blue-500",
    University: "text-red-500",
    BookOpenCheck: "text-green-500",
    FilePenLine: "text-orange-500",
    FileText: "text-purple-500",
    Briefcase: "text-indigo-500",
    Languages: "text-teal-500",
    Users: "text-pink-500",
}


interface ServiceCardProps {
  icon: IconName;
  title: string;
  description: string;
}

export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  const IconComponent = icons[icon];
  const colorClass = iconColors[icon];
  return (
    <Card className="flex flex-col items-start p-6 space-y-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 bg-slate-100 dark:bg-[#1A2A3A] text-foreground dark:text-white w-full">
      <div className="p-3 bg-background/50 dark:bg-white/10 rounded-full">
        {IconComponent && <IconComponent className={`h-8 w-8 ${colorClass}`} />}
      </div>
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-muted-foreground dark:text-slate-200">{description}</p>
      </CardContent>
    </Card>
  );
}
