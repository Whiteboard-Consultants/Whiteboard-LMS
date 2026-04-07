/**
 * RIASEC Quiz Component
 * Displays assessment questions and collects responses
 */

'use client';

import React, { useState } from 'react';
import { riasecQuestions } from '@/lib/riasec-data';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface RIASECQuizProps {
  onSubmit: (responses: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function RIASECQuiz({
  onSubmit,
  isLoading = false,
  error = null,
}: RIASECQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = riasecQuestions[currentStep];
  const totalQuestions = riasecQuestions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;
  const hasAnswered = responses[currentQuestion.id];

  const handleSelectOption = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(responses).length !== totalQuestions) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(responses);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allQuestionsAnswered = Object.keys(responses).length === totalQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Career Assessment Quiz</h1>
          <div className="flex items-center justify-between">
            <span className="text-blue-100">
              Question {currentStep + 1} of {totalQuestions}
            </span>
            <span className="text-sm font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-blue-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map(option => (
                <label
                  key={option.value}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50"
                  style={{
                    borderColor:
                      responses[currentQuestion.id] === option.value
                        ? '#2563eb'
                        : '#e5e7eb',
                    backgroundColor:
                      responses[currentQuestion.id] === option.value
                        ? '#eff6ff'
                        : '#fafafa',
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.value}
                    checked={responses[currentQuestion.id] === option.value}
                    onChange={() => handleSelectOption(option.value)}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="ml-4 text-gray-700 font-medium">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0 || isSubmitting || isLoading}
              className="flex items-center gap-2 px-6 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {currentStep < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                disabled={!hasAnswered || isSubmitting || isLoading}
                className="ml-auto flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting || isLoading}
                className="ml-auto px-8 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  'See Results'
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {allQuestionsAnswered
              ? '✓ All questions answered. Ready to submit!'
              : `${totalQuestions - Object.keys(responses).length} questions remaining`}
          </p>
        </div>
      </div>
    </div>
  );
}
