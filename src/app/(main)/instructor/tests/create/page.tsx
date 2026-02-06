
'use client';

import { PageHeader } from "@/components/page-header";
import { SeriesTestForm } from "@/components/series-test-form";

export default function CreateTestPage() {
    return (
        <div>
            <PageHeader
                title="Create a New Test"
                description="Create a test for your course or organize it into a mock test series with specific topics and difficulty levels."
            />
            <div className="max-w-4xl mx-auto">
                <SeriesTestForm />
            </div>
        </div>
    )
}
