
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getPost } from "@/lib/supabase-data";
import { EditPostForm } from "./_components/edit-post-form";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin",
};

export default async function EditPostPage({ params }: any) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Blog Post"
        description="Update the form to edit the blog post."
      />
      <EditPostForm post={post} />
    </div>
  );
}
