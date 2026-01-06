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
      showGradient && "bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/10 rounded-lg px-6 py-6 border border-primary/10 dark:border-primary/20",
      className
    )} {...props}>
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent dark:from-primary-foreground dark:to-primary-foreground/70">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 text-base">{description}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
