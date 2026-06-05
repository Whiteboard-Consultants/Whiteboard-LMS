import { cn } from '@/lib/utils';

interface QuickAnswerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Citable summary block for AI/search — plain HTML text, visible above the fold.
 */
export function QuickAnswer({ children, className }: QuickAnswerProps) {
  return (
    <aside
      className={cn(
        'mt-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-base leading-relaxed text-foreground dark:border-primary/30 dark:bg-primary/10',
        className
      )}
      data-ai-summary="true"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-white mb-2">
        Quick answer
      </p>
      <div className="text-muted-foreground [&_p]:mb-0">{children}</div>
    </aside>
  );
}
