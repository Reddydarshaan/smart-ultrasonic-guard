import { cn } from "@/lib/utils";

interface LedIndicatorProps {
  state: 'off' | 'on' | 'blinking';
  className?: string;
}

export function LedIndicator({ state, className }: LedIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <div className={cn(
          "w-4 h-4 rounded-full transition-all duration-300",
          state === 'off' && "bg-muted",
          state === 'on' && "bg-primary glow-primary",
          state === 'blinking' && "bg-warning glow-warning animate-pulse-glow",
        )} />
        {state !== 'off' && (
          <div className={cn(
            "absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-30",
            state === 'on' && "bg-primary",
            state === 'blinking' && "bg-warning",
          )} />
        )}
      </div>
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">LED</span>
        <p className={cn(
          "text-sm font-mono font-bold",
          state === 'off' && "text-muted-foreground",
          state === 'on' && "text-primary",
          state === 'blinking' && "text-warning",
        )}>
          {state === 'off' ? 'Standby' : state === 'on' ? 'Active' : 'Motion!'}
        </p>
      </div>
    </div>
  );
}
