
'use client';

import { PageHeader } from "@/components/page-header";
import dynamic from "next/dynamic";

const TestForm = dynamic(
  () => import('@/components/test-form').then(mod => mod.TestForm),
  {
    ssr: false,
    loading: () => <p>Loading form...</p>
  }
);

export default function CreateTestPage() {
    return (
        <div>
            <PageHeader
                title="Create a New Test"
                description="Define the basic details of your test. You can add questions after creating it."
            />
            <div className="max-w-4xl mx-auto">
                <TestForm />
            </div>
        </div>
    )
}
