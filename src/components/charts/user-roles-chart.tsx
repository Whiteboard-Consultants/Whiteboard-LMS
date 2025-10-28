
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

import type { User } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '../ui/skeleton';

interface UserRolesChartProps {
  users: User[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
];

export function UserRolesChart({ users }: UserRolesChartProps) {
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
    value,
  }));
  
  const pieLabel = isMobile 
    ? undefined 
    : ({ name, percent }: {name: string, percent: number}) => `${name} ${(percent * 100).toFixed(0)}%`;


  return (
    <Card>
      <CardHeader>
        <CardTitle>User Role Distribution</CardTitle>
        <CardDescription>Breakdown of all users by their assigned role.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isClient ? <Skeleton className="h-[250px] w-full" /> : (
            <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
                />
                <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={isMobile ? 80 : 70}
                innerRadius={isMobile ? 50 : 0}
                fill="#8884d8"
                dataKey="value"
                label={pieLabel}
                >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                {isMobile && <Legend wrapperStyle={{fontSize: "0.8rem"}} />}
            </PieChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
