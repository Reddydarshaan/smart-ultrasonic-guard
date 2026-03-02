import { PinTable } from "@/components/PinTable";
import { Cpu, CircuitBoard, Lightbulb, Radio, Eye, Sun } from "lucide-react";

const components = [
  { name: "ESP32", desc: "Microcontroller with WiFi, BLE, ADC, PWM (LEDC)", icon: Cpu, color: "text-primary" },
  { name: "PIR Sensor", desc: "Passive infrared motion detector, digital output", icon: Eye, color: "text-warning" },
  { name: "LDR Sensor", desc: "Light-dependent resistor with voltage divider circuit", icon: Sun, color: "text-accent" },
  { name: "Ultrasonic Buzzer", desc: "20–60 kHz range, driven by ESP32 LEDC PWM", icon: Radio, color: "text-primary" },
  { name: "Status LED", desc: "Visual indication: off/on/blink states", icon: Lightbulb, color: "text-warning" },
  { name: "5V Power Supply", desc: "External DC adapter, 5V to ESP32 VIN", icon: CircuitBoard, color: "text-accent" },
];

export default function HardwarePage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold">Hardware Setup</h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Components & ESP32 pin mapping
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {components.map(({ name, desc, icon: Icon, color }) => (
          <div key={name} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <h3 className="text-sm font-display font-bold">{name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-display font-bold mb-3">Pin Connection Table</h2>
        <PinTable />
      </div>
    </div>
  );
}
