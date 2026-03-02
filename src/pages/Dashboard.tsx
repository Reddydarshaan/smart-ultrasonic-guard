import { useState, useEffect, useCallback } from "react";
import { StatusCard } from "@/components/StatusCard";
import { FrequencyVisualizer } from "@/components/FrequencyVisualizer";
import { MotionChart } from "@/components/MotionChart";
import { LedIndicator } from "@/components/LedIndicator";
import { createInitialState, simulateTick, type SystemState } from "@/lib/simulation";
import { Sun, Moon, Zap, Radio, Eye, ToggleLeft, ToggleRight, Shield } from "lucide-react";

export default function Dashboard() {
  const [state, setState] = useState<SystemState>(createInitialState);
  const [chartData, setChartData] = useState<{ time: string; motions: number; frequency: number }[]>([]);

  const tick = useCallback(() => {
    setState((prev) => {
      const next = simulateTick(prev);
      setChartData((cd) => {
        const entry = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          motions: next.motionCount,
          frequency: Math.round(next.currentFrequency),
        };
        return [...cd.slice(-29), entry];
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const toggleDemo = () => setState((s) => ({ ...s, demoMode: !s.demoMode }));

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold">System Dashboard</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Real-time IoT monitoring • Simulated ESP32 feed
          </p>
        </div>
        <button
          onClick={toggleDemo}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
        >
          {state.demoMode ? (
            <ToggleRight className="w-5 h-5 text-primary" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
          )}
          <span className="text-xs font-mono">
            Demo: <span className={state.demoMode ? "text-primary font-bold" : "text-muted-foreground"}>
              {state.demoMode ? "ON" : "OFF"}
            </span>
          </span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatusCard
          title="Day/Night"
          value={state.isNight ? "Night" : "Day"}
          icon={state.isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          status={state.isNight ? 'info' : 'inactive'}
          subtitle={`LDR: ${Math.round(state.ldrValue)}`}
        />
        <StatusCard
          title="System"
          value={state.systemActive ? "Active" : "Standby"}
          icon={<Shield className="w-4 h-4" />}
          status={state.systemActive ? 'active' : 'inactive'}
          subtitle={state.demoMode ? "Demo mode" : "Normal mode"}
        />
        <StatusCard
          title="Motion Count"
          value={state.motionCount}
          icon={<Eye className="w-4 h-4" />}
          status={state.motionDetected ? 'warning' : state.motionCount > 0 ? 'info' : 'inactive'}
          subtitle={state.aggressiveMode ? "⚡ Aggressive" : "Normal"}
        />
        <StatusCard
          title="Frequency"
          value={state.systemActive ? `${(state.currentFrequency / 1000).toFixed(1)}kHz` : "—"}
          icon={<Radio className="w-4 h-4" />}
          status={state.aggressiveMode ? 'warning' : state.systemActive ? 'active' : 'inactive'}
          subtitle={state.aggressiveMode ? "Sweep mode" : "Idle sweep"}
        />
      </div>

      {/* Frequency Visualizer + LED */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
        <FrequencyVisualizer
          frequency={state.currentFrequency}
          active={state.systemActive}
          aggressive={state.aggressiveMode}
        />
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center justify-center gap-4">
          <LedIndicator state={state.ledState} />
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <Zap className={`w-3.5 h-3.5 ${state.aggressiveMode ? 'text-warning' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-mono ${state.aggressiveMode ? 'text-warning font-bold' : 'text-muted-foreground'}`}>
                {state.aggressiveMode ? "AGGRESSIVE" : "NORMAL"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motion Chart */}
      <MotionChart data={chartData} />
    </div>
  );
}
