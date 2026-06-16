/**
 * RIASEC Career Assessment Tool - Main Component
 * Handles registration, quiz, and results flow
 */

'use client';

import React, { useState, useRef } from 'react';
import { RIASECRegistration } from './RIASECRegistration';
import { RIASECQuiz } from './RIASECQuiz';
import { RIASECResults } from './RIASECResults';

type AssessmentStep = 'registration' | 'quiz' | 'results';

interface AssessmentState {
  step: AssessmentStep;
  userId: string | null;
  assessmentId: string | null;
  userEmail: string | null;
  fullName: string | null;
  scores: Record<string, number> | null;
  profileDetails: any[] | null;
}

export function RIASECAssessment({ campaign }: { campaign?: string }) {
  const [state, setState] = useState<AssessmentState>({
    step: 'registration',
    userId: null,
    assessmentId: null,
    userEmail: null,
    fullName: null,
    scores: null,
    profileDetails: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle successful registration
  const handleRegistrationComplete = (data: {
    userId: string;
    email: string;
    fullName: string;
    assessmentId: string;
  }) => {
    setState(prev => ({
      ...prev,
      step: 'quiz',
      userId: data.userId,
      assessmentId: data.assessmentId,
      userEmail: data.email,
      fullName: data.fullName,
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = async (responses: Record<string, string>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/riasec/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: state.assessmentId,
          responses,
          campaign,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          step: 'results',
          scores: data.results.scores,
          profileDetails: data.results.profileDetails,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Render appropriate step
  const renderStep = () => {
    switch (state.step) {
      case 'registration':
        return (
          <RIASECRegistration
            onComplete={handleRegistrationComplete}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'quiz':
        return (
          <RIASECQuiz
            onSubmit={handleQuizSubmit}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'results':
        return (
          <RIASECResults
            scores={state.scores!}
            profileDetails={state.profileDetails!}
            studentName={state.fullName}
            studentEmail={state.userEmail}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {renderStep()}
    </div>
  );
}
