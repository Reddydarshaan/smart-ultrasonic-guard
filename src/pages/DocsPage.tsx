import { cn } from "@/lib/utils";

const sections = [
  {
    title: "System Architecture",
    content: `The Smart Ultrasonic Pest Repeller uses an ESP32 microcontroller as the central processing unit. It reads environmental data from an LDR (light) and PIR (motion) sensor, processes the inputs through adaptive control logic, and drives an ultrasonic buzzer at dynamically varying frequencies between 20–60 kHz.

The system architecture follows a sensor → processor → actuator pattern with a cloud feedback loop:
• Sensors (LDR + PIR) → ESP32 → Ultrasonic Buzzer + LED
• ESP32 → WiFi → ThingSpeak/Blynk Dashboard (IoT monitoring)

All logic runs on the ESP32 using non-blocking timing (millis()), ensuring responsive sensor polling and smooth frequency transitions.`,
  },
  {
    title: "Working Explanation",
    content: `1. **Power On**: ESP32 initializes sensors, connects to WiFi, and enters the main loop.

2. **LDR Check**: The analog LDR reading determines day/night. Below threshold (500) = night. If DEMO_MODE is true, this check is bypassed.

3. **PIR Monitoring**: The PIR sensor is polled every 100ms (debounced). Each detection is timestamped and stored in a circular buffer of 20 entries.

4. **Activity Analysis**: The system counts how many motion events occurred within a 10-second sliding window. If ≥3 events are detected, aggressive mode activates.

5. **Frequency Control**: 
   - Normal mode: Slow sweep between 20–60 kHz (500 Hz steps every 50ms)
   - Aggressive mode: Fast sweep (2000 Hz steps every 20ms)
   - The LEDC peripheral handles precise PWM frequency generation.

6. **LED Feedback**: OFF during standby, solid ON when active, blinking when motion is detected.

7. **Cloud Upload**: Every 15 seconds, the system sends day/night status, demo mode state, motion count, current frequency, and system state to ThingSpeak via HTTP GET.`,
  },
  {
    title: "IoT Dashboard Structure",
    content: `The IoT dashboard (ThingSpeak or Blynk) displays 5 data fields:

| Field | Data | Widget |
|-------|------|--------|
| Field 1 | Day/Night (0/1) | Status indicator |
| Field 2 | Demo Mode (0/1) | Toggle display |
| Field 3 | Motion Count | Numeric + Line chart |
| Field 4 | Current Frequency (Hz) | Gauge + Line chart |
| Field 5 | System Active (0/1) | Status LED widget |

**Recommended ThingSpeak Setup:**
- Create a channel with 5 fields
- Add visualizations: Line chart for Field 3 & 4, Status indicators for 1, 2, 5
- Set update interval to 15 seconds
- Use MATLAB Analysis for motion pattern detection (optional)

**For Blynk Alternative:**
- Use Virtual Pins V0–V4 mapped to each field
- Add SuperChart widget for motion history
- Use LED widget for system status
- Add Switch widget to toggle Demo Mode remotely`,
  },
  {
    title: "Demo Mode",
    content: `Demo Mode is critical for lab/classroom demonstrations where the system needs to operate during daytime.

**When DEMO_MODE = true:**
- LDR reading is completely ignored
- System activates regardless of ambient light
- All other features work normally (PIR, frequency sweep, cloud upload)
- Dashboard shows "Demo: ON" indicator

**When DEMO_MODE = false:**
- System follows normal day/night cycle
- Only activates when LDR reads below threshold (night)
- During daytime, buzzer is silent, LED is off
- PIR readings are still processed but don't trigger buzzer

To toggle: Change the \`#define DEMO_MODE\` value in the code and re-upload, or implement remote toggle via Blynk Virtual Pin.`,
  },
  {
    title: "Frequency Sweep Logic",
    content: `The adaptive frequency sweep prevents pests from habituating to a single frequency:

**Normal Operation:**
- Sweeps linearly from 20 kHz → 60 kHz → 20 kHz
- Step size: 500 Hz every 50ms
- Full cycle time: ~8 seconds
- Creates gentle, continuous frequency variation

**Aggressive Mode (≥3 motions in 10s):**
- Same sweep range but 4× faster
- Step size: 2000 Hz every 20ms  
- Full cycle time: ~1 second
- Rapid, unpredictable frequency changes
- Maximizes pest deterrent effectiveness

**Technical Implementation:**
- Uses ESP32's LEDC (LED Control) peripheral
- \`ledcSetup(channel, frequency, resolution)\` sets PWM frequency
- \`ledcWrite(channel, duty)\` controls output (50% duty = 128/255)
- No external DAC or signal generator needed`,
  },
];

export default function DocsPage() {
  return (
    <div className="container py-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-display font-bold">Documentation</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          System architecture, working explanation & IoT setup
        </p>
      </div>

      {sections.map(({ title, content }, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-display font-bold mb-3 text-primary">{title}</h2>
          <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-line font-body">
            {content.split('\n').map((line, j) => {
              if (line.startsWith('|')) {
                return <code key={j} className="block text-xs font-mono text-muted-foreground">{line}</code>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={j} className="font-bold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return <p key={j} className="ml-4 text-muted-foreground">{line}</p>;
              }
              return <span key={j}>{line}{'\n'}</span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
