
import { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getPosts } from "@/lib/supabase-data";
import { PostTable } from "./_components/post-table";

export const metadata: Metadata = {
  title: "Blog Management | Admin",
};

export default async function BlogManagementPage() {
  const posts = await getPosts();

  return (
    <div>
      <PageHeader
        title="Blog Management"
        description="Create, edit, and manage all blog posts."
      />
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="/admin/blog/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No blog posts found.</p>
          <p className="text-sm text-muted-foreground">
            If this is a new installation, you may need to create the posts table in Supabase.
          </p>
        </div>
      ) : (
        <PostTable posts={posts} />
      )}
    </div>
  );
}
