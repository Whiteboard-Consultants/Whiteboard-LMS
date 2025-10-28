
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Post } from "@/types";

// Define the form schema to match our Post type
const postFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  slug: z.string().min(2, { message: "Slug must be at least 2 characters." }),
  excerpt: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  imageUrl: z.string().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Please enter a valid URL or leave empty."
  }),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
  tags: z.string(),
  featured: z.boolean(),
});

type PostFormData = z.infer<typeof postFormSchema>;

interface CreatePostData extends PostFormData {
  author: {
    id: string;
    name: string;
  };
}



export async function createPost(formData: PostFormData, authorData: { id: string; name: string }) {
  try {
    // Validate form data
    const validatedData = postFormSchema.parse(formData);
    
    // Convert tags string to array
    const tagsArray = validatedData.tags
      ? validatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    // Use admin client to bypass RLS
    const db = supabaseAdmin || supabase;
    
    // Check if slug already exists
    const { data: existingPost, error: checkError } = await db
      .from('posts')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingPost) {
      return { success: false, error: 'A post with this slug already exists. Please choose a different slug.' };
    }
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = validatedData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));
    
    const insertData = {
      title: validatedData.title,
      slug: validatedData.slug,
      excerpt: validatedData.excerpt || '',
      content: validatedData.content,
      category: validatedData.category,
      status: 'published',
      featured: validatedData.featured,
      published: true, // for the existing 'published' boolean field
      tags: tagsArray,
      ...(validatedData.imageUrl && validatedData.imageUrl.trim() !== "" && {
        featured_image: validatedData.imageUrl,
        featured_image_url: validatedData.imageUrl
      }),
      author_id: authorData.id,
      author_name: authorData.name,
      read_time_minutes: readTimeMinutes,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Insert the post (using existing table schema)
    const { data, error } = await db
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { success: false, error: 'Failed to create post. Please try again.' };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    
    return { success: true, data };
    
  } catch (error) {
    console.error("Error in createPost:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data. Please check your inputs.' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}

export async function updatePost(postId: string, formData: PostFormData, authorData?: { id: string; name: string }) {
  try {
    // Validate form data
    const validatedData = postFormSchema.parse(formData);
    
    // Convert tags string to array
    const tagsArray = validatedData.tags
      ? validatedData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    // Use admin client to bypass RLS
    const db = supabaseAdmin || supabase;
    
    // Check if slug already exists for other posts
    const { data: existingPost, error: checkError } = await db
      .from('posts')
      .select('id')
      .eq('slug', validatedData.slug)
      .neq('id', postId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingPost) {
      return { success: false, error: 'A post with this slug already exists. Please choose a different slug.' };
    }
    
    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = validatedData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));
    
    // Update the post (using existing table schema)
    const updateData: any = {
      title: validatedData.title,
      slug: validatedData.slug,
      excerpt: validatedData.excerpt || '',
      content: validatedData.content,
      category: validatedData.category,
      featured: validatedData.featured,
      published: validatedData.featured, // update published status based on featured for now
      tags: tagsArray,
      ...(validatedData.imageUrl && validatedData.imageUrl.trim() !== "" && {
        featured_image: validatedData.imageUrl,
        featured_image_url: validatedData.imageUrl
      }),
      read_time_minutes: readTimeMinutes,
      updated_at: new Date().toISOString(),
    };
    
    // Update author info if provided
    if (authorData) {
      updateData.author_id = authorData.id;
      updateData.author_name = authorData.name;
    }
    
    const { data, error } = await db
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating post:", error);
      return { success: false, error: 'Failed to update post. Please try again.' };
    }

    if (!data) {
      return { success: false, error: 'Post not found.' };
    }

    revalidatePath(`/admin/blog/edit/${postId}`);
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    
    return { success: true, data };
    
  } catch (error) {
    console.error("Error in updatePost:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data. Please check your inputs.' };
    }
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}

export async function deletePost(postId: string) {
  try {
    // Use admin client to bypass RLS
    const db = supabaseAdmin || supabase;
    
    const { error } = await db
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { success: false, error: 'Failed to delete post. Please try again.' };
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    
    return { success: true };
    
  } catch (error) {
    console.error("Error in deletePost:", error);
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
