import type { Metadata } from 'next';

import { getTestAttempt } from "@/app/student/actions";
import { TestResultsClient } from "./client";


export const metadata: Metadata = {
  alternates: {
    canonical: '/student/test-results/[attemptId]',
  },
};

export default async function TestResultsPage({ params }: { params: { attemptId: string } }) {
  const attempt = await getTestAttempt(params.attemptId);

  if (!attempt) {
    return <div>Attempt not found</div>;
  }

  return <TestResultsClient attempt={attempt} />;
}
