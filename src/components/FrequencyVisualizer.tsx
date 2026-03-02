import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FrequencyVisualizerProps {
  frequency: number;
  active: boolean;
  aggressive: boolean;
  className?: string;
}

export function FrequencyVisualizer({ frequency, active, aggressive, className }: FrequencyVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (!active) {
        // Flat line
        ctx.strokeStyle = "hsl(220, 14%, 25%)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        animId = requestAnimationFrame(draw);
        return;
      }

      const normalizedFreq = (frequency - 20000) / 40000;
      const waveCount = 3 + normalizedFreq * 12;
      const amplitude = aggressive ? h * 0.4 : h * 0.25;
      const t = Date.now() / (aggressive ? 200 : 500);

      // Glow effect
      ctx.shadowBlur = aggressive ? 20 : 10;
      ctx.shadowColor = aggressive ? "hsl(38, 92%, 50%)" : "hsl(160, 84%, 45%)";
      ctx.strokeStyle = aggressive
        ? `hsl(${38 + Math.sin(t) * 10}, 92%, 50%)`
        : `hsl(160, 84%, 45%)`;
      ctx.lineWidth = aggressive ? 2.5 : 1.5;

      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const progress = x / w;
        const envelope = Math.sin(progress * Math.PI);
        const y = h / 2 + Math.sin(progress * waveCount * Math.PI * 2 + t) * amplitude * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [frequency, active, aggressive]);

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Frequency Waveform
        </span>
        <span className={cn(
          "text-xs font-mono",
          aggressive ? "text-warning" : active ? "text-primary" : "text-muted-foreground"
        )}>
          {active ? `${(frequency / 1000).toFixed(1)} kHz` : "STANDBY"}
        </span>
      </div>
      <canvas ref={canvasRef} width={600} height={120} className="w-full h-[120px]" />
    </div>
  );
}
