import { extractKeyTakeaways } from '@/lib/blog-utils';

interface BlogKeyTakeawaysProps {
  excerpt: string;
}

export function BlogKeyTakeaways({ excerpt }: BlogKeyTakeawaysProps) {
  const takeaways = extractKeyTakeaways(excerpt);
  if (takeaways.length === 0) return null;

  return (
    <aside
      className="mb-10 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 dark:border-primary/30 dark:bg-primary/10"
      data-ai-summary="true"
      aria-label="Key takeaways"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white mb-3">
        Key takeaways
      </p>
      <ul className="space-y-2 text-base text-muted-foreground list-disc pl-5">
        {takeaways.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
