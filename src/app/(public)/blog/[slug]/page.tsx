
import { getPosts } from "@/lib/supabase-data";
import { notFound } from "next/navigation";
import { Post } from "@/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Tag } from "lucide-react";
import { Metadata } from "next";
import { convertToDate } from "@/lib/date-utils";
import { format } from "date-fns";
import { parseSlugFromUrl, generateSlug } from "@/lib/slug-utils";


type PostPageProps = {
    params: {
        slug: string;
    };
};

async function getPost(slug: string): Promise<Post | null> {
    const posts = await getPosts();
    const decodedSlug = parseSlugFromUrl(slug);
    const normalizedSlug = generateSlug(decodedSlug);
    
    // Try multiple matching strategies to handle various URL formats
    const post = posts.find(p => 
        p.slug === decodedSlug || 
        p.slug === slug || 
        p.slug === normalizedSlug ||
        // Fallback: Match by normalized title for manually-typed URLs
        generateSlug(p.title) === normalizedSlug
    );
    return post || null;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: encodeURIComponent(post.slug) }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) {
        return {
            title: "Post Not Found",
        };
    }
    return {
        title: `${post.title} | Whiteboard Consultants Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.imageUrl ? [
                {
                    url: post.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ] : [],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const createdDate = convertToDate(post.createdAt);
    const updatedDate = convertToDate(post.updatedAt);
    
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "image": post.imageUrl,
        "author": {
            "@type": "Person",
            "name": post.author.name
        },
        "publisher": {
            "@type": "Organization",
            "name": "Whiteboard Consultants",
            "logo": {
                "@type": "ImageObject",
                "url": "https://whiteboard-consultants-mock.com/logo.png"
            }
        },
        "datePublished": createdDate?.toISOString() || new Date().toISOString(),
        "dateModified": updatedDate?.toISOString() || new Date().toISOString()
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="bg-background text-foreground">
                <article>
                    <header className="relative py-24 md:py-40 bg-slate-900 text-white overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            {post.imageUrl && post.imageUrl.trim() !== '' ? (
                                <>
                                    <Image 
                                        src={post.imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover scale-110 transition-transform duration-700 hover:scale-105"
                                        priority
                                    />
                                    {/* Enhanced overlay for better text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-slate-900/60" />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary via-primary-600 to-primary-800" />
                            )}
                        </div>
                        <div className="container mx-auto px-4 text-center relative z-10">
                            <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-6 leading-tight drop-shadow-lg">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-base md:text-lg text-white/90 backdrop-blur-sm bg-black/20 rounded-lg px-6 py-3 mx-auto max-w-fit">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 md:h-5 md:w-5" />
                                    <span className="font-medium">{post.author.name}</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                                    <time dateTime={createdDate?.toISOString() || ''}>{createdDate ? format(createdDate, 'dd MMM yyyy') : 'Unknown date'}</time>
                                </div>
                                <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 md:h-5 md:w-5" />
                                    <Badge variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20">{post.category}</Badge>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="container mx-auto px-4 py-12 md:py-20">
                        {/* Optional: Show featured image again in content if desired */}
                        {post.imageUrl && post.featuredImageAlt && (
                            <div className="mb-12 text-center">
                                <Image 
                                    src={post.imageUrl}
                                    alt={post.featuredImageAlt}
                                    width={800}
                                    height={400}
                                    className="rounded-lg shadow-lg mx-auto"
                                />
                                {post.featuredImageAlt && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">{post.featuredImageAlt}</p>
                                )}
                            </div>
                        )}
                        <div className="prose dark:prose-invert lg:prose-xl max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                </article>
            </div>
        </>
    );
}
