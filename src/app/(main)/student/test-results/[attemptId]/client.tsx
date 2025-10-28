
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TestAttempt, Test, TestQuestion } from "@/types";
import { getDoc, doc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-compat';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';

interface TestResultsClientProps {
  attempt: TestAttempt;
}

export function TestResultsClient({ attempt }: TestResultsClientProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[] | null>(null);

  useEffect(() => {
    if (attempt) {
      const fetchTestAndQuestions = async () => {
        const testRef = doc(db, 'tests', attempt.testId);
        const testSnap = await getDoc(testRef);
        if (testSnap.exists()) {
          setTest(testSnap.data() as Test);
        }

        const questionsQuery = query(collection(db, 'questions'), where('testId', '==', attempt.testId), orderBy('order'));
        const questionsSnap = await getDocs(questionsQuery);
        setQuestions(questionsSnap.docs.map(doc => doc.data() as TestQuestion));
      };

      fetchTestAndQuestions();
    }
  }, [attempt]);

  if (!attempt || !test || !questions) {
    return <div>Loading...</div>;
  }

  const { score, totalMarks, correctAnswers, incorrectAnswers, unattempted } = attempt;

  const data = [
    { name: 'Correct', value: correctAnswers },
    { name: 'Incorrect', value: incorrectAnswers },
    { name: 'Unattempted', value: unattempted },
  ];

  const COLORS = ['#4CAF50', '#F44336', '#FFC107'];

  return (
    <div className="container mx-auto p-4">
        <Link href="/student/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="mr-2" />
            Back to Dashboard
        </Link>
      <h1 className="text-2xl font-bold mb-4">Test Results</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Score:</strong> {score} / {totalMarks}</p>
            <p><strong>Correct Answers:</strong> {correctAnswers}</p>
            <p><strong>Incorrect Answers:</strong> {incorrectAnswers}</p>
            <p><strong>Unattempted:</strong> {unattempted}</p>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Review Answers</h3>
          {questions.map((question, index) => {
            const userAnswer = attempt.answers[index];
            const isCorrect = userAnswer?.selectedOption === question.correctOption;
            return (
              <div key={question.id} className="mb-4 p-4 border rounded-lg">
                <p className="font-semibold">{index + 1}. {question.text}</p>
                <div className="mt-2">
                  {question.options.map((option, i) => {
                    const isUserAnswer = userAnswer?.selectedOption === i;
                    const isCorrectAnswer = question.correctOption === i;
                    let className = 'p-2 rounded';
                    if (isUserAnswer) {
                      className += isCorrect ? ' bg-green-200' : ' bg-red-200';
                    } else if (isCorrectAnswer) {
                      className += ' bg-green-200';
                    }
                    return <div key={i} className={className}>{option}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
