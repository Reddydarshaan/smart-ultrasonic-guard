import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'active' | 'inactive' | 'warning' | 'info';
  subtitle?: string;
  className?: string;
}

const statusColors = {
  active: 'border-primary/30 glow-primary',
  inactive: 'border-border',
  warning: 'border-warning/30 glow-warning',
  info: 'border-accent/30 glow-accent',
};

export function StatusCard({ title, value, icon, status = 'inactive', subtitle, className }: StatusCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 transition-all duration-300",
      statusColors[status],
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={cn(
          "text-muted-foreground transition-colors",
          status === 'active' && 'text-primary',
          status === 'warning' && 'text-warning',
          status === 'info' && 'text-accent',
        )}>{icon}</span>
      </div>
      <div className={cn(
        "text-2xl font-bold font-mono",
        status === 'active' && 'text-primary text-glow-primary',
        status === 'warning' && 'text-warning',
        status === 'info' && 'text-accent text-glow-accent',
      )}>
        {value}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
