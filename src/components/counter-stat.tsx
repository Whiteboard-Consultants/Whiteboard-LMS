
"use client";

import { useEffect, useState, useRef } from "react";
import type { LucideProps } from "lucide-react";
import { Clock, Users, Award, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconName = "Clock" | "Users" | "Award" | "Target";

const icons: Record<IconName, React.ComponentType<LucideProps>> = {
  Clock,
  Users,
  Award,
  Target,
};

export interface StatProps {
  icon: IconName;
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
  color?: string;
}

export function CounterStat({ icon, value, label, suffix = "", duration = 2000, color }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const Icon = icons[icon];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isMounted]);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      if (start === end) return;

      const incrementTime = (duration / end);
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [value, duration, isInView]);
  
  if (!isMounted) {
      return (
        <div className="flex flex-col items-center">
            <div className={cn("h-10 w-10 mb-3 bg-muted rounded-full animate-pulse")} />
            <div className="text-4xl md:text-5xl font-bold bg-muted h-12 w-24 rounded-md animate-pulse"></div>
            <div className="text-sm mt-1 bg-muted h-4 w-32 rounded-md animate-pulse"></div>
        </div>
      )
  }

  return (
    <div ref={ref} className="flex flex-col items-center">
      <Icon className={cn("h-10 w-10 mb-3", color)} />
      <p className="text-4xl md:text-5xl font-bold">
        {count}
        {suffix}
      </p>
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}
