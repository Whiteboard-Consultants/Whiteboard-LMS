
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { PostForm } from "@/components/admin/blog/post-form";
import { createPost } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function NewPostForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: any) => {
    if (!userData) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to create a post." });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[Client] Submitting blog post with values:", { 
        title: values.title, 
        slug: values.slug, 
        contentLength: values.content?.length,
        userId: userData.id
      });
      
      // Ensure all values are properly serialized
      const formData = {
        title: String(values.title),
        slug: String(values.slug),
        excerpt: String(values.excerpt || ''),
        content: String(values.content),
        imageUrl: String(values.imageUrl || ''),
        category: String(values.category),
        tags: String(values.tags),
        featured: Boolean(values.featured),
        authorName: String(values.authorName)
      };
      
      console.log("[Client] Calling createPost with formData:", formData);
      
      const result = await createPost(formData, {
        id: String(userData.id),
        name: String(userData.name)
      });
      
      console.log("[Client] Got result:", result);
      setIsSubmitting(false);

      if (result.success) {
        toast({ title: "Success", description: "Post created successfully." });
        router.push("/admin/blog");
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed to create post." });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("[Client] Error submitting blog post:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while saving the post.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  };

  return <PostForm onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
