
import { Post } from "@/types";

export const posts: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: "Mastering the GMAT: A Guide to Success",
        slug: "mastering-the-gmat",
        author: {
            name: "John Doe",
            id: "1"
        },
        category: "GMAT",
        excerpt: "A comprehensive guide to help you prepare for the GMAT exam.",
        content: "<p>The GMAT is a challenging exam, but with the right preparation, you can succeed. This guide will provide you with the information you need to create a study plan, find the right resources, and develop the skills you need to ace the exam.</p>",
        imageUrl: "/images/courses/online-course-hero.webp",
        status: "published",
        featured: true,
        tags: ["GMAT", "test prep", "MBA"]
    }
];
