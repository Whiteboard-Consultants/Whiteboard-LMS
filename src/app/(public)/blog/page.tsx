
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/supabase-data";
import { format } from "date-fns";
import { convertToDate } from "@/lib/date-utils";
import BlogTabs from "@/components/blog-tabs";

export const metadata: Metadata = {
  title: "Education Blog | Study Abroad, Test Prep & Career Tips | Whiteboard Consultants",
  description: "Expert education blog on study abroad, IELTS/TOEFL/GMAT/GRE prep, and career development. Get free tips from Kolkata's leading education consultants.",
  alternates: {
      canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  // CollectionPage schema for better SERP visibility
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Whiteboard Consultants Blog",
    "description": "Expert insights on study abroad, test preparation, and career development",
    "url": "https://www.whiteboardconsultant.com/blog",
    "image": "https://www.whiteboardconsultant.com/blog-hero.jpg",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Whiteboard Consultants",
      "url": "https://www.whiteboardconsultant.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.slice(0, 10).map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.whiteboardconsultant.com/blog/${encodeURIComponent(post.slug)}`,
        "name": post.title,
        "image": post.imageUrl,
        "description": post.excerpt,
        "author": {
          "@type": "Person",
          "name": post.author.name
        },
        "datePublished": post.publishedAt || post.createdAt
      }))
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.whiteboardconsultant.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.whiteboardconsultant.com/blog"
      }
    ]
  };

  return (
    <>
      <Script
        id="blog-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Script
        id="blog-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="bg-background dark:bg-black">
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-headline">
                  Whiteboard Consultants Blog
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  The latest articles, news, and insights from our team on study abroad, test preparation, and career development.
                </p>
            </div>
        </div>
      </section>

      <BlogTabs posts={posts} />
      </div>
    </>
  );
}
