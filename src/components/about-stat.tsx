
"use client";

import { useEffect, useState, useRef } from "react";

export interface AboutStatProps {
  value: number;
  label: string;
  subLabel: string;
  suffix?: string;
  duration?: number;
}

export function AboutStat({ value, label, subLabel, suffix = "", duration = 2000 }: AboutStatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
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
  }, []);


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

  return (
    <div ref={ref} className="flex flex-col items-center text-primary-foreground">
      <p className="text-5xl md:text-6xl font-bold">
        {count}
        {suffix}
      </p>
      <p className="text-xl font-semibold mt-2">{label}</p>
      <p className="text-sm text-primary-foreground/80 mt-1">{subLabel}</p>
    </div>
  );
}
