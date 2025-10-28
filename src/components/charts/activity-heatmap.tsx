
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ActivityHeatmapProps {
  students: { lastLogin?: Date | null }[];
}

export function ActivityHeatmap({ students }: ActivityHeatmapProps) {
  const activityByDay: { [key: string]: number } = {
    'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0,
  };

  students.forEach(student => {
    if (student.lastLogin) {
      const day = format(student.lastLogin, 'E'); // 'E' gives 'Mon', 'Tue', etc.
      activityByDay[day]++;
    }
  });

  const chartData = Object.entries(activityByDay).map(([name, total]) => ({ name, total }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity Heatmap</CardTitle>
        <CardDescription>
          Shows on which days students were most recently active.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
