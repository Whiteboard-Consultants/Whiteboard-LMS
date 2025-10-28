'use client';

import TestTaker from "@/components/test-taker";
import { useParams } from "next/navigation";

export default function TestTakerPage() {
    const params = useParams();
    const testId = params.testId as string;
    return <TestTaker testId={testId} />;
}