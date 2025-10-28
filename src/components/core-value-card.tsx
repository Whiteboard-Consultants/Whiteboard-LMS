
import { CheckCircle2, Users, Lightbulb, Handshake, LucideProps } from 'lucide-react';
import React from "react";
import { cn } from "@/lib/utils";

export type IconName = "CheckCircle2" | "Users" | "Lightbulb" | "Handshake";

const icons: Record<IconName, React.ComponentType<LucideProps>> = {
  CheckCircle2,
  Users,
  Lightbulb,
  Handshake,
};

const iconStyles: Record<IconName, { bg: string, text: string }> = {
    CheckCircle2: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
    Users: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
    Lightbulb: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
    Handshake: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" }
}

export interface CoreValueProps {
  icon: IconName;
  title: string;
  description: string;
}

export function CoreValueCard({ icon, title, description }: CoreValueProps) {
  const IconComponent = icons[icon];
  const styles = iconStyles[icon];
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className={cn("p-4 rounded-full inline-flex", styles.bg)}>
        {IconComponent && <IconComponent className={cn("h-8 w-8", styles.text)} />}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
