import { Post } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Blogs</h2>
        <Link 
          href="/blog" 
          className="text-sm text-primary hover:underline flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 6).map((post) => (
          <RelatedPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Navigation buttons for more posts */}
      <div className="flex justify-center mt-8 space-x-4">
        <button className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
          prev
        </button>
        <button className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
          next
        </button>
      </div>
    </section>
  );
}

function RelatedPostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        {/* Featured Image */}
        {post.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <CardContent className="p-4">
          {/* Category Badge */}
          <Badge variant="secondary" className="text-xs mb-2">
            {post.category}
          </Badge>
          
          {/* Title */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary">
            {post.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          
          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{post.author.name}</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTimeMinutes || 5} min</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}