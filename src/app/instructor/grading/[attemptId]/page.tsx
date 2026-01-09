'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'mcq' | 'descriptive';
  text: string;
  model_answer?: string;
}

interface QuizAttempt {
  id: string;
  answers: (number | string | null)[];
  questions: Question[];
  student_name?: string;
  course_title?: string;
  lesson_title?: string;
  submitted_at: string;
  grading_status: 'pending' | 'reviewed' | 'graded';
  instructor_feedback?: string;
  instructor_score?: number;
}

export default function GradingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonQuestionIndex, setComparisonQuestionIndex] = useState<number | null>(null);
  const [similarAnswers, setSimilarAnswers] = useState<any[]>([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const supabase = await import('@supabase/supabase-js').then(m =>
          m.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/auth/sign-in');
          return;
        }

        setUserId(user.id);

        // Import action - relative path from dynamic route
        const module = await import('../actions');
        const { getQuizAttemptForGrading } = module;
        const result = await getQuizAttemptForGrading(attemptId, user.id);

        if (!result.success) {
          setError(result.error || 'Failed to load attempt');
          return;
        }

        const attemptData = result.data as any;

        // Transform data to match interface
        setAttempt({
          id: attemptData.id,
          answers: attemptData.answers,
          questions: attemptData.questions,
          student_name: attemptData.enrollments?.student_name,
          course_title: attemptData.enrollments?.course_title,
          lesson_title: attemptData.lessons?.title,
          submitted_at: attemptData.submitted_at,
          grading_status: attemptData.grading_status,
          instructor_feedback: attemptData.instructor_feedback,
          instructor_score: attemptData.instructor_score,
        });

        // Pre-populate feedback if already graded
        if (attemptData.instructor_feedback) {
          setFeedback(attemptData.instructor_feedback);
        }
        if (attemptData.instructor_score !== null && attemptData.instructor_score !== undefined) {
          setScore(attemptData.instructor_score);
        }
      } catch (error) {
        console.error('❌ Error loading attempt:', error);
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [attemptId, router]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback before submitting');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const module = await import('../actions');
      const { submitGradingFeedback } = module;
      const result = await submitGradingFeedback(attemptId, userId, feedback, score);

      if (!result.success) {
        setError(result.error || 'Failed to submit feedback');
        return;
      }

      // Update local state
      if (attempt) {
        setAttempt({
          ...attempt,
          grading_status: 'reviewed',
          instructor_feedback: feedback,
          instructor_score: score,
        });
      }

      // Show success message and redirect after delay
      setTimeout(() => {
        router.push('/instructor/grading');
      }, 1500);
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowComparison = async (questionIndex: number) => {
    setComparisonQuestionIndex(questionIndex);
    setShowComparison(true);
    setLoadingComparison(true);

    try {
      const module = await import('../actions');
      const { getSimilarAnswers } = module;
      const result = await getSimilarAnswers(attemptId, userId!, questionIndex);

      if (result.success) {
        setSimilarAnswers(result.data);
      } else {
        setError('Failed to load similar answers');
      }
    } catch (error) {
      console.error('❌ Error loading similar answers:', error);
      setError('Failed to load comparison data');
    } finally {
      setLoadingComparison(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 bg-slate-200 rounded"></div>
          <div className="h-96 w-full bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return null;
  }

  const descriptiveQuestions = attempt.questions.filter((q) => q.type === 'descriptive');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/instructor/grading">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Grading
            </Button>
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{attempt.student_name}</h1>
            <div className="space-y-1 text-slate-600">
              <p>
                <span className="font-medium">Course:</span> {attempt.course_title}
              </p>
              <p>
                <span className="font-medium">Assessment:</span> {attempt.lesson_title}
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{' '}
                {new Date(attempt.submitted_at).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-orange-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Responses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Student Responses</h2>
          <div className="space-y-6">
            {descriptiveQuestions.map((question, index) => {
              const answerIndex = attempt.questions.indexOf(question);
              const studentAnswer = attempt.answers[answerIndex];

              return (
                <Card key={question.id} className="border-slate-200">
                  <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Question {index + 1}: {question.text}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded">
                          Descriptive
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowComparison(attempt.questions.indexOf(question))}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Compare
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Student Answer */}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Student Answer</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-slate-700 whitespace-pre-wrap">
                          {typeof studentAnswer === 'string' && studentAnswer.trim()
                            ? studentAnswer
                            : '(No answer provided)'}
                        </div>
                      </div>

                      {/* Model Answer */}
                      {question.model_answer && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Suggested Model Answer</h4>
                          <div className="bg-green-50 border border-green-200 rounded p-4 text-slate-700 whitespace-pre-wrap">
                            {question.model_answer}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Feedback Form */}
        <Card>
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Provide Feedback</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Feedback <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Provide constructive feedback on the student's responses. Include specific points they did well and areas for improvement."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-600 mt-2">
                {feedback.length} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Score (optional)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 85"
                  value={score ?? ''}
                  onChange={(e) => setScore(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-24"
                />
                <span className="flex items-center text-slate-600">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Leave blank if providing feedback only
              </p>
            </div>

            <Button
              onClick={handleSubmitFeedback}
              disabled={submitting || !feedback.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </CardContent>
        </Card>

        {/* Success Message */}
        {attempt.grading_status === 'reviewed' && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-green-700 font-medium">
                ✓ Feedback submitted successfully
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comparison Modal */}
        {showComparison && comparisonQuestionIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl max-h-[80vh] overflow-y-auto w-full">
              <CardHeader className="border-b bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle>Compare Student Answers</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComparison(false)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingComparison ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block">Loading...</div>
                  </div>
                ) : similarAnswers.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">
                    No similar answers to compare
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-semibold text-blue-900 mb-2">Current Student's Answer</h4>
                      <p className="text-blue-800 whitespace-pre-wrap text-sm">
                        {typeof attempt.answers[comparisonQuestionIndex] === 'string'
                          ? attempt.answers[comparisonQuestionIndex]
                          : '(No answer)'}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Similar Answers from Other Students ({similarAnswers.length})
                      </h4>
                      <div className="space-y-3">
                        {similarAnswers.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-slate-900">
                                {item.studentName}
                              </p>
                              <span className="text-xs text-slate-600">
                                {item.wordCount} words
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">
                              {item.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
