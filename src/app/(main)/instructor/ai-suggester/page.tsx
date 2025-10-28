import { PageHeader } from "@/components/page-header";
import { AiSuggesterForm } from "@/components/ai-suggester-form";

export default function AiSuggesterPage() {
  return (
    <div>
      <PageHeader
        title="AI Content Suggester"
        description="Stuck for ideas? Describe your course and let AI help you build it."
      />
      <div className="max-w-4xl mx-auto">
        <AiSuggesterForm />
      </div>
    </div>
  );
}
