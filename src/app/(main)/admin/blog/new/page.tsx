
import { Metadata } from "next";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { NewPostForm } from "./_components/new-post-form";

export const metadata: Metadata = {
  alternates: {
    canonical: '/admin/blog/new',
  },
  title: "New Blog Post | Admin",
};

export default function NewPostPage() {
  return (
    <div>
      <PageHeader
        title="New Blog Post"
        description="Fill out the form to create a new blog post."
      >
        <Button asChild variant="outline">
          <Link href="/instructor/ai-suggester">
            <Lightbulb className="mr-2 h-4 w-4" />
            AI Suggester
          </Link>
        </Button>
      </PageHeader>
      <NewPostForm />
    </div>
  );
}
