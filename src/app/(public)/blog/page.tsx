
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPosts } from "@/lib/supabase-data";

export const metadata: Metadata = {
  title: "Blog | Whiteboard Consultants",
  description: "Read the latest articles, news, and insights from the team at Whiteboard Consultants on study abroad, test preparation, and career development.",
  alternates: {
      canonical: '/blog',
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="bg-background dark:bg-black">
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-headline">
              Whiteboard Consultants Blog
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              The latest articles, news, and insights from our team on study abroad, test preparation, and career development.
            </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center col-span-full py-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">No Posts Found</h2>
              <p className="mt-2 text-muted-foreground">
                There are currently no blog posts available. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${encodeURIComponent(post.slug)}`} className="group flex flex-col">
                  <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl h-full flex flex-col bg-card">
                    <div className="relative h-56 w-full">
                      {post.imageUrl && post.imageUrl.trim() !== '' ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
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
                          <time dateTime={new Date(post.createdAt).toISOString()}>{new Date(post.createdAt).toLocaleDateString()}</time>
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
    </div>
  );
}
