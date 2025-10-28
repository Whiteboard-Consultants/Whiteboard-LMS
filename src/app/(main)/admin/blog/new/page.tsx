
import { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { NewPostForm } from "./_components/new-post-form";

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
};

export default function NewPostPage() {
  return (
    <div>
      <PageHeader
        title="New Blog Post"
        description="Fill out the form to create a new blog post."
      />
      <NewPostForm />
    </div>
  );
}
