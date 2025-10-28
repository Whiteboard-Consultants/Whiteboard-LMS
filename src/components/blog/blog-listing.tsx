"use client";

import { Post } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Eye, Search, Filter, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { convertToDate } from "@/lib/date-utils";

interface BlogListingProps {
  posts: Post[];
  categories: string[];
}

export function BlogListing({ posts, categories }: BlogListingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (convertToDate(b.publishedAt || b.createdAt) || new Date(0)).getTime() - (convertToDate(a.publishedAt || a.createdAt) || new Date(0)).getTime();
        case "oldest":
          return (convertToDate(a.publishedAt || a.createdAt) || new Date(0)).getTime() - (convertToDate(b.publishedAt || b.createdAt) || new Date(0)).getTime();
        case "popular":
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        default:
          return 0;
      }
    });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover insights, tips, and guides to help you succeed in your study abroad journey.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.slice(0, 2).map((post) => (
              <FeaturedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <span className="text-sm text-muted-foreground">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
          </span>
        </div>
        
        {regularPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Load More Button */}
      {regularPosts.length > 9 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  );
}

function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <div className="flex flex-col md:flex-row">
          {post.imageUrl && (
            <div className="relative aspect-video md:aspect-square md:w-1/2 overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.featuredImageAlt || post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              <Badge className="absolute top-4 left-4">Featured</Badge>
            </div>
          )}
          
          <CardContent className="p-6 md:w-1/2 flex flex-col justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                {post.category}
              </Badge>
              
              <h3 className="font-bold text-xl mb-3 line-clamp-2 hover:text-primary">
                {post.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author.name}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTimeMinutes || 5} min
                </span>
              </div>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.viewsCount || 0}
              </span>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}

function BlogPostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        {post.imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardContent className="p-6">
          <Badge variant="secondary" className="mb-3">
            {post.category}
          </Badge>
          
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 hover:text-primary">
            {post.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {(() => {
                  const date = convertToDate(post.publishedAt || post.createdAt);
                  return date ? format(date, "MMM d, yyyy") : "Unknown date";
                })()}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {post.readTimeMinutes || 5} min
              </span>
            </div>
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {post.viewsCount || 0}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}