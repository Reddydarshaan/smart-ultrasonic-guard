import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sun, Moon, ToggleRight, ToggleLeft, Power, PowerOff,
  Activity, Zap, RefreshCw, AlertTriangle, Wifi
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip
} from "recharts";

interface FeedEntry {
  created_at: string;
  field1: string | null;
  field2: string | null;
  field3: string | null;
  field4: string | null;
  field5: string | null;
}

interface DashboardData {
  isNight: boolean;
  demoMode: boolean;
  systemActive: boolean;
  frequency: number;
  motionCount: number;
  lastUpdated: Date;
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function parseLatestFeed(feed: FeedEntry): DashboardData {
  return {
    isNight: feed.field1 === "1",
    demoMode: feed.field2 === "1",
    motionCount: parseInt(feed.field3 || "0", 10),
    frequency: parseFloat(feed.field4 || "0"),
    systemActive: feed.field5 === "1",
    lastUpdated: new Date(feed.created_at),
  };
}

export default function LiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<{ time: string; motions: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick clock for relative time
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch("https://api.thingspeak.com/channels/3282831/feeds.json?results=1"),
        fetch("https://api.thingspeak.com/channels/3282831/fields/3.json?results=20"),
      ]);
      if (!latestRes.ok || !historyRes.ok) throw new Error("API error");

      const latestJson = await latestRes.json();
      const historyJson = await historyRes.json();

      if (latestJson.feeds?.length) {
        setData(parseLatestFeed(latestJson.feeds[0]));
      }

      if (historyJson.feeds?.length) {
        setHistory(
          historyJson.feeds
            .filter((f: any) => f.field3 != null)
            .map((f: any) => ({
              time: new Date(f.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", hour12: false,
              }),
              motions: parseInt(f.field3 || "0", 10),
            }))
        );
      }
      setError(null);
    } catch {
      setError("Failed to load data – check connection or ThingSpeak status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(), 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  const freqPercent = data ? Math.min((data.frequency / 4500) * 100, 100) : 0;
  const buzzerActive = data ? data.frequency > 0 : false;

  if (loading) {
    return (
      <div className="container py-8 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
            <Wifi className="w-5 h-5 text-primary" />
            Smart Ultrasonic Guard
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Real-time Monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs text-muted-foreground font-mono">
              Updated {relativeTime(data.lastUpdated)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Day/Night */}
            <Card className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              data.isNight ? "border-primary/30 glow-primary" : "border-warning/30 glow-warning"
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  Day / Night Status
                  {data.isNight
                    ? <Moon className="w-5 h-5 text-primary" />
                    : <Sun className="w-5 h-5 text-warning" />
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold font-mono ${
                  data.isNight ? "text-primary text-glow-primary" : "text-warning"
                }`}>
                  {data.isNight ? "Night" : "Day"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.isNight ? "System eligible to activate" : "Standby (unless Demo)"}
                </p>
              </CardContent>
            </Card>

            {/* Demo Mode */}
            <Card className="transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  Demo Mode
                  {data.demoMode
                    ? <ToggleRight className="w-5 h-5 text-primary" />
                    : <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={data.demoMode ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {data.demoMode ? "ON" : "OFF"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.demoMode ? "LDR bypass active" : "Normal operation"}
                </p>
              </CardContent>
            </Card>

            {/* System Active */}
            <Card className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              data.systemActive ? "border-primary/30 glow-primary" : "border-border"
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  System Status
                  {data.systemActive
                    ? <Power className="w-5 h-5 text-primary" />
                    : <PowerOff className="w-5 h-5 text-muted-foreground" />
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={data.systemActive ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {data.systemActive ? "Active" : "Standby"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.systemActive ? "Buzzer & sensors running" : "Idle – waiting for trigger"}
                </p>
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              buzzerActive ? "border-accent/30 glow-accent" : "border-border"
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  Current Frequency
                  <Activity className={`w-5 h-5 ${buzzerActive ? "text-accent animate-pulse-glow" : "text-muted-foreground"}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold font-mono ${buzzerActive ? "text-accent text-glow-accent" : "text-muted-foreground"}`}>
                    {data.frequency.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">Hz</span>
                </div>
                <Progress value={freqPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">Range: 0 – 4,500 Hz</p>
              </CardContent>
            </Card>

            {/* Motion Count */}
            <Card className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
              data.motionCount > 0 ? "border-warning/30 glow-warning" : "border-border"
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  Motion Count
                  <Zap className={`w-5 h-5 ${data.motionCount > 0 ? "text-warning" : "text-muted-foreground"}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className={`text-3xl font-bold font-mono ${
                  data.motionCount > 0 ? "text-warning" : "text-muted-foreground"
                }`}>
                  {data.motionCount}
                </span>
                <p className="text-xs text-muted-foreground mt-1">PIR detections this cycle</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Motion Activity – Last 20 Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "hsl(215 12% 55%)", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(220 14% 18%)" }}
                      />
                      <YAxis
                        tick={{ fill: "hsl(215 12% 55%)", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "hsl(220 14% 18%)" }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(220 18% 10%)",
                          border: "1px solid hsl(220 14% 18%)",
                          borderRadius: "8px",
                          fontSize: 12,
                          color: "hsl(210 20% 92%)",
                        }}
                        formatter={(value: number) => [value, "Motions"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="motions"
                        stroke="hsl(160 84% 45%)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "hsl(160 84% 45%)" }}
                        activeDot={{ r: 5, stroke: "hsl(160 84% 45%)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Footer */}
      <div className="text-center py-4 border-t border-border">
        <p className="text-xs text-muted-foreground font-mono">
          Powered by ESP32-S3 & ThingSpeak
        </p>
      </div>
    </div>
  );
}
