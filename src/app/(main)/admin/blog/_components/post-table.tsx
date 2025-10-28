
"use client";

import { Post } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeletePostButton } from "./delete-post-button";
import { convertToDate } from "@/lib/date-utils";

interface PostTableProps {
  posts: Post[];
}

export function PostTable({ posts }: PostTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>{post.title}</TableCell>
            <TableCell>{post.category}</TableCell>
            <TableCell>
              {(() => {
                try {
                  const date = convertToDate(post.createdAt);
                  return date ? format(date, "PPP") : 'Invalid Date';
                } catch {
                  return 'Invalid Date';
                }
              })()}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/blog/edit/${post.id}`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
