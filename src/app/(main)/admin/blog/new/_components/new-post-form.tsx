
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
    const result = await createPost(values, {
      id: userData.id,
      name: userData.name
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Success", description: "Post created successfully." });
      router.push("/admin/blog");
    } else {
      console.error("Create post result:", result);
      toast({ variant: "destructive", title: "Error", description: result.error || "Failed to create post." });
    }
  };

  return <PostForm onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
