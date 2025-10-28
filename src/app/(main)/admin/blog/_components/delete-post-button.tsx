
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePost } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deletePost(postId);
    setIsDeleting(false);

    if (result.success) {
      toast({ title: "Success", description: "Post deleted successfully." });
      router.refresh(); // Refresh the page to update the list
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}
