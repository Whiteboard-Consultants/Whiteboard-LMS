'use client';

import { TestAccessGate } from "@/components/test-access-gate";
import { useParams } from "next/navigation";

export default function TestTakerPage() {
    const params = useParams();
    const testId = params.testId as string;
    console.log('📄 [Page] TestTakerPage rendered with testId:', testId);
    return (
        <div>
            {testId ? (
                <TestAccessGate testId={testId} />
            ) : (
                <div className="text-red-500 p-4">No test ID provided</div>
            )}
        </div>
    );
}