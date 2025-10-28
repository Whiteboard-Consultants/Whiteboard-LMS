
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BrainCircuit, Leaf, ShieldCheck, AreaChart as AreaChartIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "../ui/skeleton"

const chartData = [
  { year: "2025", "ai-ml": 12, "green-tech": 10, "data-analytics": 15, "cybersecurity": 8 },
  { year: "2026", "ai-ml": 18, "green-tech": 14, "data-analytics": 20, "cybersecurity": 12 },
  { year: "2027", "ai-ml": 25, "green-tech": 19, "data-analytics": 27, "cybersecurity": 18 },
  { year: "2028", "ai-ml": 35, "green-tech": 25, "data-analytics": 36, "cybersecurity": 25 },
  { year: "2029", "ai-ml": 48, "green-tech": 32, "data-analytics": 45, "cybersecurity": 34 },
  { year: "2030", "ai-ml": 60, "green-tech": 40, "data-analytics": 55, "cybersecurity": 45 },
]

const chartConfig = {
  "ai-ml": {
    label: "AI & Machine Learning",
    color: "#3B82F6", // Blue
    icon: BrainCircuit,
  },
  "green-tech": {
    label: "Green Tech",
    color: "#F97316", // Orange
    icon: Leaf,
  },
  "data-analytics": {
    label: "Data Analytics",
    color: "#14B8A6", // Teal
    icon: AreaChartIcon,
  },
  "cybersecurity": {
    label: "Cybersecurity",
    color: "#64748B", // Slate Gray
    icon: ShieldCheck,
  },
} satisfies ChartConfig

export default function JobTrendsChartSection() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-muted dark:bg-slate-dark">
            <div className="container px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg sm:text-xl md:text-2xl lg:text-3xl"><Skeleton className="h-6 sm:h-7 md:h-8 lg:h-9 w-3/4" /></CardTitle>
                        <CardDescription><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 sm:px-6">
                        <Skeleton className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </section>
    )
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 bg-muted dark:bg-slate-dark">
      <div className="container px-4 sm:px-6 lg:px-8">
        <Card className="w-full overflow-hidden">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="font-headline text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight">Projected Growth in Key Job Sectors (2025-2030)</CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              This chart illustrates the projected increase in demand (in percentage growth points) for key future-proof career fields. Hover over the chart for details.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-4 sm:px-6">
            <ChartContainer config={chartConfig} className="min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[400px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 8,
                  right: 8,
                  top: 8,
                  bottom: 8,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(0, 4)}
                />
                 <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="ai-ml"
                  fill="var(--color-ai-ml)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="green-tech"
                  fill="var(--color-green-tech)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="data-analytics"
                  fill="var(--color-data-analytics)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
                 <Bar
                  dataKey="cybersecurity"
                  fill="var(--color-cybersecurity)"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
