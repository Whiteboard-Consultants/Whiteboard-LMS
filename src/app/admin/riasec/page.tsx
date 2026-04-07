/**
 * RIASEC Admin Analytics Page (Template)
 * Shows assessment data and insights
 */

'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AssessmentSummary {
  totalAssessments: number;
  profileDistribution: Record<string, number>;
  averageScores: Record<string, number>;
  recentAssessments: any[];
}

export default function RIASECAdminPage() {
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessmentData();
  }, []);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      
      // Get all assessments
      const { data: assessments, error: fetchError } = await supabase
        .from('riasec_assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate summary
      const profileDistribution: Record<string, number> = {};
      const scoreAccumulator: Record<string, number[]> = {
        realistic: [],
        investigative: [],
        artistic: [],
        social: [],
        enterprising: [],
        conventional: [],
      };

      assessments.forEach((assessment: any) => {
        // Count profiles
        const profile = assessment.primary_profile;
        profileDistribution[profile] = (profileDistribution[profile] || 0) + 1;

        // Aggregate scores
        scoreAccumulator.realistic.push(assessment.realistic_score || 0);
        scoreAccumulator.investigative.push(assessment.investigative_score || 0);
        scoreAccumulator.artistic.push(assessment.artistic_score || 0);
        scoreAccumulator.social.push(assessment.social_score || 0);
        scoreAccumulator.enterprising.push(assessment.enterprising_score || 0);
        scoreAccumulator.conventional.push(assessment.conventional_score || 0);
      });

      // Calculate averages
      const averageScores: Record<string, number> = {};
      Object.entries(scoreAccumulator).forEach(([profile, scores]) => {
        averageScores[profile] = scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
          : 0;
      });

      setSummary({
        totalAssessments: assessments.length,
        profileDistribution,
        averageScores,
        recentAssessments: assessments.slice(0, 10),
      });
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading assessments...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="p-8">No data available</div>;
  }

  const profileColors: Record<string, string> = {
    realistic: '#ef4444',
    investigative: '#3b82f6',
    artistic: '#ec4899',
    social: '#10b981',
    enterprising: '#f59e0b',
    conventional: '#8b5cf6',
  };

  const profileNames: Record<string, string> = {
    realistic: 'Realistic',
    investigative: 'Investigative',
    artistic: 'Artistic',
    social: 'Social',
    enterprising: 'Enterprising',
    conventional: 'Conventional',
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">RIASEC Assessment Analytics</h1>
        <p className="text-gray-600">View career assessment insights and student data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Assessments</h3>
          <p className="text-4xl font-bold text-blue-600">{summary.totalAssessments}</p>
          <p className="text-sm text-gray-500 mt-2">Students who have completed the assessment</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Most Common Profile</h3>
          <p className="text-4xl font-bold text-indigo-600">
            {Object.entries(summary.profileDistribution).sort((a, b) => b[1] - a[1])[0]?.[0]?.toUpperCase() || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {Object.entries(summary.profileDistribution).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} students
          </p>
        </div>
      </div>

      {/* Profile Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Distribution</h2>
        <div className="space-y-4">
          {Object.entries(summary.profileDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([profile, count]) => (
              <div key={profile}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">{profileNames[profile]}</span>
                  <span className="text-gray-600">{count} ({Math.round((count / summary.totalAssessments) * 100)}%)</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(count / summary.totalAssessments) * 100}%`,
                      backgroundColor: profileColors[profile],
                    }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Average Scores */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Average Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(summary.averageScores)
            .sort((a, b) => b[1] - a[1])
            .map(([profile, score]) => (
              <div key={profile} className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: profileColors[profile] }}
                  >
                    {profile[0].toUpperCase()}
                  </div>
                </div>
                <p className="font-semibold text-gray-800">{profileNames[profile]}</p>
                <p className="text-2xl font-bold" style={{ color: profileColors[profile] }}>
                  {score.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">out of 30</p>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Assessments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Primary Profile</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Completed</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentAssessments.map((assessment: any) => (
                <tr key={assessment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{assessment.full_name}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{assessment.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: profileColors[assessment.primary_profile] }}
                    >
                      {assessment.primary_profile?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    {Math.max(
                      assessment.realistic_score || 0,
                      assessment.investigative_score || 0,
                      assessment.artistic_score || 0,
                      assessment.social_score || 0,
                      assessment.enterprising_score || 0,
                      assessment.conventional_score || 0
                    )}/30
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(assessment.completed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
