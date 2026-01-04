
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

  console.log('📅 ActivityHeatmap - Students count:', students.length);
  console.log('📅 ActivityHeatmap - Full students data:', JSON.stringify(students, null, 2));

  let studentsWithLogin = 0;
  students.forEach(student => {
    if (student.lastLogin) {
      studentsWithLogin++;
      const day = format(student.lastLogin, 'E'); // 'E' gives 'Mon', 'Tue', etc.
      activityByDay[day]++;
      console.log(`  ✓ ${student.name}: lastLogin = ${student.lastLogin.toISOString()} → Day: ${day}`);
    } else {
      console.log(`  ✗ ${student.name}: lastLogin = ${student.lastLogin}`);
    }
  });

  console.log('📅 ActivityHeatmap - Students with lastLogin:', studentsWithLogin, '/', students.length);
  console.log('📅 ActivityHeatmap - Activity by day:', activityByDay);

  const chartData = Object.entries(activityByDay).map(([name, total]) => ({ name, total }));
  console.log('📅 ActivityHeatmap - Chart data:', chartData);

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
