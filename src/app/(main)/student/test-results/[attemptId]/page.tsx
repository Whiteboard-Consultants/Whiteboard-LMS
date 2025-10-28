
import { getTestAttempt } from "@/app/student/actions";
import { TestResultsClient } from "./client";

export default async function TestResultsPage({ params }: { params: { attemptId: string } }) {
  const attempt = await getTestAttempt(params.attemptId);

  if (!attempt) {
    return <div>Attempt not found</div>;
  }

  return <TestResultsClient attempt={attempt} />;
}
