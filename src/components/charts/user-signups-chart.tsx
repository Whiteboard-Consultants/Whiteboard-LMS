
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface UserSignupsChartProps {
  data: { name: string; total: number; }[];
}

export function UserSignupsChart({ data }: UserSignupsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New User Sign-ups</CardTitle>
        <CardDescription>
          A look at the number of new users over the past 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
            <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
                />
                <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
