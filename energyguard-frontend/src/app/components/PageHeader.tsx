import { Badge } from "./ui/badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  showLive?: boolean;
}

export function PageHeader({ title, description, showLive = true }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          EnergyGuard CI
        </p>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {showLive && (
        <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 w-fit">
          <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse inline-block" />
          Surveillance en temps réel
        </Badge>
      )}
    </div>
  );
}
