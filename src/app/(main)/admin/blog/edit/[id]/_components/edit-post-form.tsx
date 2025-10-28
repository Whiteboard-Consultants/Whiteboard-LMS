
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Post } from "@/types";
import { PostForm } from "@/components/admin/blog/post-form";
import { postFormSchema } from "@/app/(main)/admin/blog/_components/post-form";
import { updatePost } from "@/app/(main)/admin/blog/actions";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface EditPostFormProps {
  post: Post;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: z.infer<typeof postFormSchema>) => {
    if (!userData) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to update a post." });
      return;
    }

    setIsSubmitting(true);
    const result = await updatePost(post.id, values, {
      id: userData.id,
      name: userData.name
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Success", description: "Post updated successfully." });
      router.push("/admin/blog");
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  return <PostForm post={post} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
