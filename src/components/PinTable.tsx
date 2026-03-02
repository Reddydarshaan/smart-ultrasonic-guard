import { PIN_TABLE } from "@/lib/esp32-code";
import { cn } from "@/lib/utils";

export function PinTable({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Component</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Pin</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Connection</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {PIN_TABLE.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 text-primary font-medium">{row.component}</td>
                <td className="px-4 py-2.5 text-accent">{row.pin}</td>
                <td className="px-4 py-2.5 text-foreground">{row.connection}</td>
                <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
