import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  showGradient?: boolean;
}

export function PageHeader({ title, description, children, className, showGradient = true, ...props }: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8",
      showGradient && "bg-gradient-to-r from-primary/15 to-primary/20 dark:from-primary/40 dark:to-primary/30 rounded-lg px-6 py-8 border border-primary/20 dark:border-primary/40 shadow-sm",
      className
    )} {...props}>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline text-primary dark:text-primary-foreground">{title}</h1>
        {description && <p className="text-foreground/75 dark:text-primary-foreground/80 mt-2 text-base font-medium">{description}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
