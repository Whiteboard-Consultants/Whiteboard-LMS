import Link from 'next/link';
import { User } from 'lucide-react';
import { getBlogAuthorProfile } from '@/lib/blog-authors';

interface BlogAuthorBylineProps {
  authorName: string;
  authorBio?: string;
}

export function BlogAuthorByline({ authorName, authorBio }: BlogAuthorBylineProps) {
  const profile = getBlogAuthorProfile(authorName);

  return (
    <div className="mb-10 flex items-start gap-4 rounded-lg border bg-muted/30 px-5 py-4 dark:bg-slate-900/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <User className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
          Written by
        </p>
        <p className="text-lg font-semibold text-foreground">
          <Link
            href={profile.url}
            target={profile.url.startsWith('http') ? '_blank' : undefined}
            rel={profile.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="hover:text-primary hover:underline"
          >
            {authorName}
          </Link>
        </p>
        {profile.title && (
          <p className="text-sm text-muted-foreground">{profile.title}</p>
        )}
        {authorBio && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{authorBio}</p>
        )}
      </div>
    </div>
  );
}
