/**
 * RIASEC Results Component
 * Displays assessment results and career profile information
 */

'use client';

import React, { useState } from 'react';
import { Download, Share2, Mail, CheckCircle } from 'lucide-react';

interface RIASECResultsProps {
  scores: Record<string, number>;
  profileDetails: any[];
  studentName?: string | null;
  studentEmail?: string | null;
}

export function RIASECResults({
  scores,
  profileDetails,
  studentName,
  studentEmail,
}: RIASECResultsProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const primaryProfile = profileDetails[0];
  const profilesByType = {
    realistic: profileDetails.find(p => p?.id === 'realistic'),
    investigative: profileDetails.find(p => p?.id === 'investigative'),
    artistic: profileDetails.find(p => p?.id === 'artistic'),
    social: profileDetails.find(p => p?.id === 'social'),
    enterprising: profileDetails.find(p => p?.id === 'enterprising'),
    conventional: profileDetails.find(p => p?.id === 'conventional'),
  };

  const handleCopyResults = () => {
    const text = `My RIASEC Career Assessment Results:
Primary: ${profileDetails[0]?.name}
Secondary: ${profileDetails[1]?.name}
Tertiary: ${profileDetails[2]?.name}

Scores:
${Object.entries(scores)
  .map(([type, score]) => `${type.charAt(0).toUpperCase() + type.slice(1)}: ${score}/30`)
  .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My RIASEC Career Assessment Results',
          text: `I just completed a career assessment and discovered I'm a ${primaryProfile?.name} personality type!`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Assessment Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Your results have been sent to{' '}
            <span className="font-semibold">{studentEmail}</span>
          </p>
        </div>

        {/* Primary Profile Card */}
        {primaryProfile && (
          <div
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
            style={{
              borderTop: `6px solid ${primaryProfile.color}`,
            }}
          >
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl"
                  style={{ backgroundColor: primaryProfile.color }}
                >
                  {primaryProfile.code}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    Your Primary Profile
                  </p>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {primaryProfile.name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {primaryProfile.description}
                  </p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Key Strengths
                      </p>
                      <ul className="space-y-1">
                        {primaryProfile.strengths.slice(0, 3).map((strength: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryProfile.color }}></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Career Examples
                      </p>
                      <ul className="space-y-1">
                        {primaryProfile.careerExamples.slice(0, 3).map((career: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">
                            • {career}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary & Tertiary Profiles */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {profileDetails.slice(1, 3).map((profile, index) => (
            <div
              key={profile?.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              style={{
                borderLeft: `4px solid ${profile?.color}`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: profile?.color }}
                  >
                    {profile?.code}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      {['Secondary', 'Tertiary'][index]} Profile
                    </p>
                    <h3 className="text-lg font-bold text-gray-800">
                      {profile?.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{profile?.description}</p>
                <p className="text-xs text-gray-500">
                  Score: <span className="font-semibold">{scores[profile?.id?.toLowerCase()]}/30</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Score Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Complete Scores</h3>
          <div className="space-y-6">
            {Object.entries(profilesByType).map(([type, profile]) => {
              if (!profile) return null;
              const score = scores[type] || 0;
              const percentage = (score / 30) * 100;

              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: profile.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{profile.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {score}/30
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: profile.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6">What's Next?</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Explore Career Paths</h4>
                <p className="text-sm text-gray-600">
                  Research careers that match your primary profile type
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Enroll in Programs</h4>
                <p className="text-sm text-gray-600">
                  Discover courses and programs aligned with your interests
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Build Your Skills</h4>
                <p className="text-sm text-gray-600">
                  Develop competencies relevant to your chosen career path
                </p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={handleCopyResults}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Copy
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <a
              href={`mailto:?subject=My Career Assessment Results&body=Check out my RIASEC Assessment results! I'm a ${primaryProfile?.name} personality type.`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition font-medium"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </div>

        {/* Footer Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">
            Your results email has been sent to <span className="font-semibold">{studentEmail}</span>
          </p>
          <p className="text-sm text-gray-600">
            This assessment provides a snapshot of your career interests. Your preferences may evolve as you gain experience and exposure to different fields.
          </p>
        </div>
      </div>
    </div>
  );
}
