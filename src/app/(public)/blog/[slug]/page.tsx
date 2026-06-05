
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
import { Breadcrumb } from "@/components/breadcrumb";
import { BlogFAQSection } from "@/components/blog/blog-faq-section";
import { BlogKeyTakeaways } from "@/components/blog/blog-key-takeaways";
import { BlogAuthorByline } from "@/components/blog/blog-author-bylines";
import { generateBlogPostSchema, generateBreadcrumbSchema, generateFAQSchema, cleanSchema } from "@/lib/schema-markup";
import { getBlogAuthorUrl } from "@/lib/blog-authors";
import { getDefaultFaqsForSlug } from "@/lib/blog-default-faqs";

const HUSTLE_CULTURE_SLUG = "hustle-culture-gen-z-student-burnout-2026";

const HUSTLE_CULTURE_FAQS = [
    {
        question: "How does Hustle Culture affect Gen Z students in India?",
        answer: "Hustle Culture pushes Gen Z students in India to constantly optimise their time with extra courses, test prep and side projects, often at the cost of sleep, rest and mental health, which increases the risk of academic burnout."
    },
    {
        question: "What are signs of student burnout among Indian college students?",
        answer: "Common signs include chronic exhaustion, loss of motivation, increased irritability, declining performance despite long study hours and feeling guilty whenever you rest or say no to new commitments."
    },
    {
        question: "How can Gen Z students in India protect themselves from burnout?",
        answer: "Setting realistic limits, building tech-free time into each day, talking honestly about stress and seeking support from counsellors or education consultants can help students balance ambition with well-being."
    },
    {
        question: "How can Whiteboard Consultants help students facing burnout?",
        answer: "Whiteboard Consultants in Kolkata offers personalised counselling, test preparation and admissions guidance to help students across India create sustainable study plans and career paths without relying on Hustle Culture overload."
    }
] as const;

function isHustleCulturePost(post: Post): boolean {
    return (
        post.slug === HUSTLE_CULTURE_SLUG ||
        post.title.toLowerCase().includes("hustle culture")
    );
}

function resolvePostFaqs(post: Post): Array<{ question: string; answer: string }> | null {
    if (post.faqSection?.length) return post.faqSection;
    const defaultFaqs = getDefaultFaqsForSlug(post.slug);
    if (defaultFaqs?.length) return defaultFaqs;
    if (isHustleCulturePost(post)) return [...HUSTLE_CULTURE_FAQS];
    return null;
}

function normalizeTags(tags: Post["tags"]): string[] | undefined {
    if (!tags) return undefined;
    return Array.isArray(tags) ? tags : undefined;
}

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

    const createdDate = convertToDate(post.createdAt);
    const updatedDate = convertToDate(post.updatedAt);
    
    const jsonLd = cleanSchema(generateBlogPostSchema({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl,
        authorName: post.author?.name || "Whiteboard Consultants",
        authorUrl: getBlogAuthorUrl(post.author?.name || "Whiteboard Consultants"),
        datePublished: createdDate || new Date(),
        dateModified: updatedDate || new Date(),
        slug: post.slug,
        category: post.category,
        tags: normalizeTags(post.tags),
    }));

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "https://www.whiteboardconsultant.com" },
        { name: "Blog", url: "https://www.whiteboardconsultant.com/blog" },
        { name: post.title, url: `https://www.whiteboardconsultant.com/blog/${post.slug}` }
    ]);

    const postFaqs = resolvePostFaqs(post);

    const faqSchema = postFaqs ? cleanSchema(generateFAQSchema(postFaqs)) : null;

    const other: Record<string, string> = {
        'application/ld+json': JSON.stringify(jsonLd),
        'application/ld+json:breadcrumb': JSON.stringify(breadcrumbSchema),
    };

    if (faqSchema) {
        other['application/ld+json:faq'] = JSON.stringify(faqSchema);
    }

    return {
        title: `${post.title} | Whiteboard Consultants Blog`,
        description: post.excerpt,
        alternates: {
            canonical: `https://www.whiteboardconsultant.com/blog/${post.slug}`,
        },
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
        other,
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

    const jsonLd = cleanSchema(generateBlogPostSchema({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl,
        authorName: post.author?.name || "Whiteboard Consultants",
        authorUrl: getBlogAuthorUrl(post.author?.name || "Whiteboard Consultants"),
        datePublished: createdDate || new Date(),
        dateModified: updatedDate || new Date(),
        slug: post.slug,
        category: post.category,
        tags: normalizeTags(post.tags),
    }));

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "https://www.whiteboardconsultant.com" },
        { name: "Blog", url: "https://www.whiteboardconsultant.com/blog" },
        { name: post.title, url: `https://www.whiteboardconsultant.com/blog/${post.slug}` }
    ]);

    const postFaqs = resolvePostFaqs(post);

    const faqSchema = postFaqs ? cleanSchema(generateFAQSchema(postFaqs)) : null;

    const faqData = postFaqs;

    const showUpdatedDate =
        updatedDate &&
        createdDate &&
        updatedDate.getTime() - createdDate.getTime() > 86400000;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <div className="bg-background text-foreground">
                <article>
                    <header className="relative py-24 md:py-40 bg-slate-900 text-white overflow-hidden">
                        <div className="container mx-auto px-4 relative z-10 mb-8">
                            <Breadcrumb items={[
                                { name: 'Blog', href: '/blog' },
                                { name: post.title, href: `/blog/${post.slug}` }
                            ]} />
                        </div>
                        <div className="absolute inset-0 z-0">
                            {post.imageUrl && post.imageUrl.trim() !== '' ? (
                                <>
                                    <Image 
                                        src={post.imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover scale-110 transition-transform duration-700 hover:scale-105"
                                        priority
                                        quality={75}
                                        sizes="100vw"
                                    />
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
                                    <time dateTime={createdDate?.toISOString() || ''}>
                                        Published {createdDate ? format(createdDate, 'dd MMM yyyy') : 'Unknown date'}
                                    </time>
                                </div>
                                {showUpdatedDate && (
                                    <>
                                        <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full"></div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                                            <time dateTime={updatedDate?.toISOString() || ''}>
                                                Updated {format(updatedDate!, 'dd MMM yyyy')}
                                            </time>
                                        </div>
                                    </>
                                )}
                                <div className="hidden sm:block w-1 h-1 bg-white/60 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 md:h-5 md:w-5" />
                                    <Badge variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20">{post.category}</Badge>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="container mx-auto px-4 py-12 md:py-20">
                        <div className="max-w-4xl mx-auto">
                            <BlogAuthorByline
                                authorName={post.author.name}
                                authorBio={post.author.bio}
                            />
                            <BlogKeyTakeaways excerpt={post.excerpt} />
                        </div>
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

                {faqData && (
                    <div className="container mx-auto px-4 py-12">
                        <BlogFAQSection faqs={faqData} />
                    </div>
                )}
            </div>
        </>
    );
}
