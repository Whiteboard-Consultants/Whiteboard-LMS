'use client';

import { TestAccessGate } from "@/components/test-access-gate";
import { useParams } from "next/navigation";

export default function TestTakerPage() {
    const params = useParams();
    const testId = params.testId as string;
  return <TestAccessGate testId={testId} />;
}
