import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SkillsByCategory {
  [category: string]: {
    total: number;
    mastered: number;
    proficient: number;
    intermediate: number;
    beginner: number;
  };
}

interface SkillsVisualizationProps {
  skillsByCategory: SkillsByCategory;
  totalSkills: number;
  masteredSkills: number;
  averageMastery: number;
}

export function SkillsVisualization({
  skillsByCategory,
  totalSkills,
  masteredSkills,
  averageMastery,
}: SkillsVisualizationProps) {
  // Prepare data for bar chart
  const categoryData = Object.entries(skillsByCategory).map(([category, stats]) => ({
    category: category.length > 12 ? category.substring(0, 12) + '...' : category,
    fullCategory: category,
    'Mastered': stats.mastered,
    'Proficient': stats.proficient,
    'Intermediate': stats.intermediate,
    'Beginner': stats.beginner,
  }));

  // Prepare data for pie chart
  const masteryData = [
    { name: 'Mastered', value: masteredSkills, color: '#16a34a' },
    { name: 'In Progress', value: totalSkills - masteredSkills, color: '#f59e0b' },
  ];

  const COLORS = {
    'Mastered': '#16a34a',
    'Proficient': '#3b82f6',
    'Intermediate': '#8b5cf6',
    'Beginner': '#ef4444',
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalSkills}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tracked & developing</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{masteredSkills}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(averageMastery)}%</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Across all skills</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(skillsByCategory).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Skill areas covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Skills by Category */}
      {categoryData.length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Skills Distribution by Category</CardTitle>
            <CardDescription className="dark:text-gray-400">Breakdown of proficiency levels across skill categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Mastered" stackId="a" fill={COLORS['Mastered']} />
                  <Bar dataKey="Proficient" stackId="a" fill={COLORS['Proficient']} />
                  <Bar dataKey="Intermediate" stackId="a" fill={COLORS['Intermediate']} />
                  <Bar dataKey="Beginner" stackId="a" fill={COLORS['Beginner']} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pie Chart - Mastery Status */}
      {totalSkills > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Mastery Overview</CardTitle>
            <CardDescription className="dark:text-gray-400">Your progress toward mastering all tracked skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={masteryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {masteryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} skills`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {Object.entries(skillsByCategory).length > 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Detailed Category Breakdown</CardTitle>
            <CardDescription className="dark:text-gray-400">Proficiency overview for each skill category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, stats]) => {
                const masteryPercentage = stats.total > 0 
                  ? Math.round((stats.mastered / stats.total) * 100)
                  : 0;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">{category}</h4>
                      <Badge variant="outline" className="text-xs dark:border-slate-500 dark:text-gray-300">
                        {stats.mastered}/{stats.total} mastered
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS['Mastered'] }} />
                        <span className="text-gray-600 dark:text-gray-400">
                          {stats.mastered} mastered
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS['Proficient'] }} />
                        <span className="text-gray-600 dark:text-gray-400">
                          {stats.proficient} proficient
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS['Intermediate'] }} />
                        <span className="text-gray-600 dark:text-gray-400">
                          {stats.intermediate} intermediate
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS['Beginner'] }} />
                        <span className="text-gray-600 dark:text-gray-400">
                          {stats.beginner} beginner
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${masteryPercentage}%`,
                          backgroundColor: masteryPercentage >= 80 ? '#16a34a' : 
                                         masteryPercentage >= 50 ? '#3b82f6' : 
                                         masteryPercentage >= 25 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalSkills === 0 && (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">No skills tracked yet. Complete courses to start tracking skills!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
