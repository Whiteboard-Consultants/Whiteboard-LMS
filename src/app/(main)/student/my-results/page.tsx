import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function QuizResultsListPage() {
  // Get all quiz attempts
  const { data: quizAttempts } = await supabaseAdmin!
    .from('quiz_attempts')
    .select(`
      id,
      score,
      total_questions,
      submitted_at,
      lesson_id,
      course_id,
      courses (
        title
      )
    `)
    .order('submitted_at', { ascending: false });

  // Get all test attempts  
  const { data: testAttempts } = await supabaseAdmin!
    .from('test_attempts')
    .select(`
      id,
      score,
      total_questions,
      percentage,
      submitted_at,
      course_id,
      test_id,
      courses (
        title
      )
    `)
    .order('submitted_at', { ascending: false });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz & Assessment Results</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quiz Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results ({quizAttempts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizAttempts?.map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{(attempt.courses as any)?.title}</p>
                    <p className="text-sm text-gray-600">
                      Score: {attempt.score}/{attempt.total_questions} 
                      ({Math.round((attempt.score / attempt.total_questions) * 100)}%)
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/student/quiz-results/${attempt.id}`}>
                    <Button size="sm">View Results</Button>
                  </Link>
                </div>
              )) || <p>No quiz attempts found</p>}
            </div>
          </CardContent>
        </Card>

        {/* Test Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results ({testAttempts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testAttempts?.map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{(attempt.courses as any)?.title}</p>
                    <p className="text-sm text-gray-600">
                      Score: {attempt.score}/{attempt.total_questions} 
                      ({attempt.percentage}%)
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.percentage >= 70 ? 'default' : 'destructive'}>
                      {attempt.percentage >= 70 ? 'Passed' : 'Failed'}
                    </Badge>
                    <Link href={`/student/quiz-results/${attempt.id}`}>
                      <Button size="sm">View Results</Button>
                    </Link>
                  </div>
                </div>
              )) || <p>No test attempts found</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}