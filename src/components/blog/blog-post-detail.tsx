"use client";

import { Post } from "@/types";
import { BlogPostHeader } from "./blog-post-header";
import { BlogFAQSection } from "./blog-faq-section";
import { RelatedPosts } from "./related-posts";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Share2, BookOpen, Award, Globe, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogPostDetailProps {
  post: Post;
  relatedPosts?: Post[];
}

export function BlogPostDetail({ post, relatedPosts = [] }: BlogPostDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Blog Post Header */}
      <BlogPostHeader post={post} />

      {/* Main Content Area */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Article Content */}
          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Content with proper typography */}
              <div 
                className="prose prose-gray max-w-none
                           prose-headings:font-bold prose-headings:text-foreground
                           prose-h1:text-3xl prose-h1:mb-6
                           prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                           prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                           prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                           prose-li:text-muted-foreground
                           prose-strong:text-foreground prose-strong:font-semibold
                           prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />

              {/* Call-to-Action Section (MetaApply style) */}
              <div className="mt-8 p-6 bg-primary/5 rounded-lg border">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Interested in Study Abroad?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    MetaApply can help - fill the form
                  </p>
                  <Button className="w-full md:w-auto">
                    Get Started Today
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    I have read and agreed to{" "}
                    <a href="/terms" className="text-primary hover:underline">terms</a>
                    {" & "}
                    <a href="/privacy" className="text-primary hover:underline">privacy policy</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">Share:</span>
            <Button variant="outline" size="sm">Facebook</Button>
            <Button variant="outline" size="sm">Instagram</Button>
            <Button variant="outline" size="sm">WhatsApp</Button>
            <Button variant="outline" size="sm">LinkedIn</Button>
            <Button variant="outline" size="sm">X</Button>
          </div>

          {/* FAQ Section */}
          {post.faqSection && post.faqSection.length > 0 && (
            <BlogFAQSection faqs={post.faqSection} />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Table of Contents */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Quick Navigation
                </h3>
                <div className="space-y-2 text-sm">
                  <a href="#introduction" className="block text-muted-foreground hover:text-primary">
                    Introduction
                  </a>
                  <a href="#courses" className="block text-muted-foreground hover:text-primary">
                    Top Courses
                  </a>
                  <a href="#conclusion" className="block text-muted-foreground hover:text-primary">
                    Conclusion
                  </a>
                  <a href="#faq" className="block text-muted-foreground hover:text-primary">
                    FAQs
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Key Highlights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Globe className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Global Opportunities</p>
                      <p className="text-xs text-muted-foreground">Study in top destinations worldwide</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Briefcase className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Career Growth</p>
                      <p className="text-xs text-muted-foreground">High-demand skills for 2025+</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Cloud */}
            {post.tags && post.tags.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}