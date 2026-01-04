'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SkillCard } from '@/components/skills/skill-card';
import { GapAnalysis } from '@/components/skills/gap-analysis';
import { SkillsVisualization } from '@/components/skills/skills-visualization';
import { Search, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mastery_percentage: number;
  practice_count: number;
  acquired_at: string;
  last_practiced_at: string;
  user_skills?: {
    endorsement_count?: number;
  };
}

interface LearningGoal {
  id: string;
  skill_id: string;
  target_proficiency_level: string;
  deadline: string;
  is_active: boolean;
}

interface SkillGap {
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  importance: 'high' | 'medium' | 'low';
  relatedCourses: { id: string; title: string }[];
}

export default function SkillsDashboardPage() {
  const { user, accessToken } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const fetchSkillsData = async () => {
      if (!accessToken) {
        console.log('❌ No access token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user skills
        console.log('📚 Fetching user skills...');
        const skillsResponse = await fetch('/api/user/skills', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('📊 Skills response status:', skillsResponse.status);

        if (skillsResponse.ok) {
          const data = await skillsResponse.json();
          console.log('✅ Skills data received:', data);
          
          // API returns { success: true, data: { skills: [...], gaps: [...], ... } }
          const skillsList = data.data?.skills || [];
          console.log('🎯 Setting skills:', skillsList.length, 'items');
          setSkills(skillsList);
        } else {
          console.error('❌ Skills response not ok:', skillsResponse.status);
        }

        // Fetch learning goals
        try {
          const goalsResponse = await fetch('/api/user/learning-goals', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (goalsResponse.ok) {
            const goalsData = await goalsResponse.json();
            console.log('✅ Goals data received:', goalsData);
            setGoals(goalsData.data || []);
          }
        } catch (e) {
          // Goals endpoint might not be available
          console.log('⚠️ Learning goals endpoint not available');
        }
      } catch (error) {
        console.error('❌ Error fetching skills data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, [accessToken]);

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || skill.proficiency_level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Calculate statistics
  const categories = Array.from(new Set(skills.map(s => s.category)));
  const totalSkills = skills.length;
  const masteredSkills = skills.filter(s => s.proficiency_level === 'expert').length;
  const averageMastery = totalSkills > 0 
    ? Math.round(skills.reduce((acc, s) => acc + s.mastery_percentage, 0) / totalSkills)
    : 0;

  // Build skills by category
  const skillsByCategory: { [key: string]: any } = {};
  categories.forEach(category => {
    const categorySkills = skills.filter(s => s.category === category);
    skillsByCategory[category] = {
      total: categorySkills.length,
      mastered: categorySkills.filter(s => s.proficiency_level === 'expert').length,
      proficient: categorySkills.filter(s => s.proficiency_level === 'advanced').length,
      intermediate: categorySkills.filter(s => s.proficiency_level === 'intermediate').length,
      beginner: categorySkills.filter(s => s.proficiency_level === 'beginner').length,
    };
  });

  // Calculate gaps for goal-based analysis
  const gapObjects = goals
    .filter(g => g.is_active)
    .map(goal => {
      const skill = skills.find(s => s.id === goal.skill_id);
      if (!skill) return null;

      const targetLevel = ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(
        goal.target_proficiency_level
      );
      const currentLevel = ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(
        skill.proficiency_level
      );

      const gap: SkillGap = {
        skillName: skill.name,
        category: skill.category,
        currentLevel: skill.mastery_percentage,
        targetLevel: Math.min(100, (targetLevel + 1) * 25),
        gap: Math.max(0, Math.min(100, (targetLevel + 1) * 25) - skill.mastery_percentage),
        importance: currentLevel === 0 ? 'high' : currentLevel === 1 ? 'medium' : 'low',
        relatedCourses: [],
      };
      return gap;
    })
    .filter((g): g is SkillGap => g !== null);

  const gaps = gapObjects;

  const totalGaps = gaps.length;
  const averageGap = totalGaps > 0 ? Math.round(gaps.reduce((acc, g) => acc + g.gap, 0) / totalGaps) : 0;
  const recommendedFocusAreas = gaps
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5)
    .map(g => `Master ${g.skillName} (${g.gap}% gap)`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading your skills dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Skills Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your professional development and identify areas for growth
          </p>
        </div>

        {/* Alert for empty state */}
        {totalSkills === 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="flex items-start gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">No skills tracked yet</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Complete courses to start tracking and developing your skills. Your progress will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">All Skills</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold dark:text-white">{totalSkills}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Skills tracked</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Mastered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{masteredSkills}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0}% of skills
                  </p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{averageMastery}%</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overall progress</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Skill areas</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Skills */}
            {skills.length > 0 && (
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Top Skills by Mastery</CardTitle>
                  <CardDescription className="dark:text-gray-400">Your strongest skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills
                      .sort((a, b) => b.mastery_percentage - a.mastery_percentage)
                      .slice(0, 4)
                      .map(skill => (
                        <SkillCard
                          key={skill.id}
                          skillName={skill.name}
                          category={skill.category}
                          proficiencyLevel={skill.proficiency_level}
                          masteryPercentage={skill.mastery_percentage}
                          practiceCount={skill.practice_count}
                          lastPracticed={new Date(skill.last_practiced_at)}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Search and Filters */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Category
                      </label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Proficiency Level
                      </label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Grid */}
            {filteredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skillName={skill.name}
                    category={skill.category}
                    proficiencyLevel={skill.proficiency_level}
                    masteryPercentage={skill.mastery_percentage}
                    practiceCount={skill.practice_count}
                    lastPracticed={new Date(skill.last_practiced_at)}
                  />
                ))}
              </div>
            ) : (
              <Card className="dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    No skills match your filters. Try adjusting your search.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gaps">
            <GapAnalysis
              gaps={gaps}
              totalGaps={totalGaps}
              averageGap={averageGap}
              recommendedFocusAreas={recommendedFocusAreas}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <SkillsVisualization
              skillsByCategory={skillsByCategory}
              totalSkills={totalSkills}
              masteredSkills={masteredSkills}
              averageMastery={averageMastery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
