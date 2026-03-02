import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface MotionChartProps {
  data: { time: string; motions: number; frequency: number }[];
  className?: string;
}

export function MotionChart({ data, className }: MotionChartProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
        Motion Activity & Frequency
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="motionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 14%, 18%)",
              borderRadius: "8px",
              fontFamily: "JetBrains Mono",
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(210, 20%, 92%)" }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="motions"
            stroke="hsl(160, 84%, 45%)"
            fill="url(#motionGrad)"
            strokeWidth={2}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="frequency"
            stroke="hsl(200, 80%, 50%)"
            fill="url(#freqGrad)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
