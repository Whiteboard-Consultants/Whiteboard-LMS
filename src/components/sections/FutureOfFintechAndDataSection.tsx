
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BrainCircuit, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const futureStats = [
    {
        icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
        title: "Soaring Market Growth",
        description: "India's FinTech market is projected to reach $1 trillion in Assets Under Management and $200 billion in revenue by 2030 (Source: Ernst & Young).",
    },
    {
        icon: <Users className="h-8 w-8 text-green-500" />,
        title: "High Demand for Talent",
        description: "NASSCOM predicts that India will need over 1.5 million professionals in Data Science and AI by 2025, with a significant talent gap.",
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
        title: "Advanced Skill Requirements",
        description: "Employers are actively seeking professionals skilled in AI/ML, blockchain, cloud computing, and data visualization to drive innovation.",
    },
    {
        icon: <AreaChart className="h-8 w-8 text-orange-500" />,
        title: "Lucrative Career Paths",
        description: "Data Analysts and FinTech specialists are among the highest-paid professionals in India, with salaries growing faster than in many other sectors.",
    },
];

export default function FutureOfFintechAndDataSection() {
  return (
    <section className="py-16 sm:py-24 bg-background dark:bg-black">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
            Secure Your Future in FinTech & Data Analytics
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
            A degree in FinTech or Data Analytics from UOW India prepares you for high-growth careers. See why these fields are the future of business in India.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {futureStats.map((stat) => (
            <Card key={stat.title} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-900">
                <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10')}>
                    {stat.icon}
                </div>
                <CardHeader className="p-0 pt-6">
                    <CardTitle className="font-headline text-xl">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                    <p className="text-muted-foreground">{stat.description}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
