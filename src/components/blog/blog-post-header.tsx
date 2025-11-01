import { Post } from "@/types";
import { format } from "date-fns";
import { Clock, Eye, Share2, Tag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

interface BlogPostHeaderProps {
  post: Post;
}

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-primary">Blog</Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </nav>

      {/* Category Badge */}
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="text-sm">
          <Tag className="w-3 h-3 mr-1" />
          {post.category}
        </Badge>
        {post.featured && (
          <Badge variant="default" className="text-sm">
            Featured
          </Badge>
        )}
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
        {post.title}
      </h1>

      {/* Author & Meta Information */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="font-medium text-foreground">{post.author.name}</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{post.readTimeMinutes || 5} min read</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>{post.viewsCount || 0} views</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <span>Published on {format(new Date(post.publishedAt || post.createdAt), "dd MMM yyyy")}</span>
      </div>

      {/* Featured Image */}
      {post.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.imageUrl}
            alt={post.featuredImageAlt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Social Sharing Buttons */}
      <div className="flex items-center space-x-2 pt-4 border-t">
        <span className="text-sm font-medium">Share:</span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            Facebook
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            LinkedIn
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            Twitter
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}