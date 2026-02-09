import { TestAccessGate } from '@/components/test-access-gate';

type TestPageProps = {
  params: Promise<{
    testId: string;
  }>;
};

export default async function TestPage({ params }: TestPageProps) {
  const { testId } = await params;

  return <TestAccessGate testId={testId} />;
}
