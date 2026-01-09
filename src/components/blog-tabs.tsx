'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { convertToDate } from '@/lib/date-utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  publishedAt?: string;
  author: {
    name: string;
  };
}

interface BlogTabsProps {
  posts: Post[];
}

export default function BlogTabs({ posts }: BlogTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Extract unique categories and add "All" at the beginning
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(posts.map((post) => post.category))).sort();
    return ['All', ...uniqueCategories];
  }, [posts]);

  // Filter posts based on active category
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') {
      return posts;
    }
    return posts.filter((post) => post.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <section className="py-16 sm:py-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold text-sm md:text-base transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {category}
                {activeCategory === category && posts.filter(p => category === 'All' || p.category === category).length > 0 && (
                  <span className="ml-2 text-xs opacity-90">
                    ({category === 'All' ? posts.length : posts.filter(p => p.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center col-span-full py-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">No Posts Found</h2>
            <p className="mt-2 text-muted-foreground">
              There are currently no blog posts in this category. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${encodeURIComponent(post.slug)}`} className="group flex flex-col">
                <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl h-full flex flex-col bg-card">
                  <div className="relative h-56 w-full">
                    {post.imageUrl && post.imageUrl.trim() !== '' ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        priority={false}
                      />
                    ) : (
                      <div className="w-full h-full glass dark:glass-card flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Blog Image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <time dateTime={new Date(post.createdAt).toISOString()}>
                        {format(convertToDate(post.publishedAt || post.createdAt) || new Date(post.createdAt), 'dd MMM yyyy')}
                      </time>
                    </div>
                    <h2 className="text-xl font-bold font-headline text-foreground group-hover:text-primary dark:group-hover:text-white">
                      {post.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="mt-6 flex items-center font-semibold text-primary group-hover:underline dark:text-white">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
