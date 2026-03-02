import { CodeViewer } from "@/components/CodeViewer";
import { ESP32_CODE } from "@/lib/esp32-code";

export default function CodePage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold">ESP32 Arduino Code</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Complete working code • Copy and upload to Arduino IDE
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <CodeViewer code={ESP32_CODE} language="C++ (Arduino)" />

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-display font-bold mb-3">Module Structure</h3>
            <ul className="space-y-2 text-xs font-mono">
              {[
                { fn: "readLDR()", desc: "Reads light sensor, determines day/night" },
                { fn: "checkPIR()", desc: "Reads PIR, records motion timestamps" },
                { fn: "activityAnalysis()", desc: "Counts recent motions, sets aggressive mode" },
                { fn: "adaptiveFrequencyControl()", desc: "Dynamic frequency sweep via LEDC PWM" },
                { fn: "sendDataToCloud()", desc: "Posts telemetry to ThingSpeak API" },
                { fn: "updateLED()", desc: "Controls LED state (off/on/blink)" },
                { fn: "connectWiFi()", desc: "Non-blocking WiFi initialization" },
              ].map(({ fn, desc }) => (
                <li key={fn} className="flex gap-2">
                  <span className="text-primary whitespace-nowrap">{fn}</span>
                  <span className="text-muted-foreground">— {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-display font-bold text-primary mb-2">Key Design Principles</h3>
            <ul className="space-y-1.5 text-xs text-secondary-foreground">
              <li>✦ Non-blocking: uses <code className="text-accent">millis()</code> instead of <code className="text-accent">delay()</code></li>
              <li>✦ Adaptive: frequency sweep varies with activity level</li>
              <li>✦ Modular: clean function separation</li>
              <li>✦ Demo Mode: boolean toggle bypasses LDR</li>
              <li>✦ PWM via ESP32 LEDC for precise frequency control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
