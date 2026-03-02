export const ESP32_CODE = `/*
 * Smart Ultrasonic Pest Repeller System
 * ESP32 Arduino Code
 * 
 * Features:
 * - LDR-based day/night detection
 * - PIR motion sensing with activity analysis
 * - Adaptive ultrasonic frequency sweep (20-60kHz)
 * - Demo mode for lab testing
 * - IoT dashboard via ThingSpeak
 * - Non-blocking design using millis()
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ===================== PIN DEFINITIONS =====================
#define PIR_PIN        27    // PIR motion sensor digital output
#define LDR_PIN        34    // LDR analog input (ADC1_CH6)
#define BUZZER_PIN     25    // Ultrasonic buzzer PWM output
#define LED_PIN        2     // Status LED

// ===================== CONFIGURATION =====================
#define DEMO_MODE       true   // Set true for lab demo (ignores LDR)
#define LDR_THRESHOLD   500    // Light threshold (below = night)
#define MOTION_WINDOW   10000  // Motion analysis window (ms)
#define AGGRESSIVE_THRESHOLD 3 // Motion count for aggressive mode
#define FREQ_MIN        20000  // Minimum ultrasonic frequency (Hz)
#define FREQ_MAX        60000  // Maximum ultrasonic frequency (Hz)
#define FREQ_STEP_TIME  50     // Frequency change interval (ms)
#define CLOUD_INTERVAL  15000  // Cloud update interval (ms)
#define LED_BLINK_RATE  200    // LED blink interval (ms)

// ===================== WIFI CONFIG =====================
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ===================== THINGSPEAK CONFIG =====================
const char* thingSpeakAPI = "YOUR_THINGSPEAK_API_KEY";
const char* thingSpeakURL = "http://api.thingspeak.com/update";

// ===================== LEDC PWM CONFIG =====================
#define LEDC_CHANNEL    0
#define LEDC_RESOLUTION 8
#define LEDC_DUTY       128   // 50% duty cycle

// ===================== STATE VARIABLES =====================
bool isNight = false;
bool systemActive = false;
bool motionDetected = false;
bool aggressiveMode = false;
int motionCount = 0;
unsigned long motionTimestamps[20];
int motionIndex = 0;
float currentFrequency = FREQ_MIN;
bool sweepUp = true;
int ldrValue = 0;

// ===================== TIMING VARIABLES =====================
unsigned long lastFreqChange = 0;
unsigned long lastCloudUpdate = 0;
unsigned long lastLedToggle = 0;
unsigned long lastMotionCheck = 0;
bool ledState = false;

// ===================== SETUP =====================
void setup() {
  Serial.begin(115200);
  Serial.println("\\n=== Smart Ultrasonic Pest Repeller ===");
  Serial.println("Initializing...");

  // Pin setup
  pinMode(PIR_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // LEDC PWM setup for ultrasonic buzzer
  ledcSetup(LEDC_CHANNEL, FREQ_MIN, LEDC_RESOLUTION);
  ledcAttachPin(BUZZER_PIN, LEDC_CHANNEL);
  ledcWrite(LEDC_CHANNEL, 0); // Start silent

  // WiFi connection
  connectWiFi();

  // Initialize motion timestamps
  memset(motionTimestamps, 0, sizeof(motionTimestamps));

  Serial.println("System ready!");
  Serial.print("Demo Mode: ");
  Serial.println(DEMO_MODE ? "ENABLED" : "DISABLED");
}

// ===================== MAIN LOOP =====================
void loop() {
  unsigned long currentTime = millis();

  // Read sensors
  readLDR();
  checkPIR(currentTime);

  // Analyze activity pattern
  activityAnalysis(currentTime);

  // Determine system state
  systemActive = DEMO_MODE || isNight;

  // Control buzzer frequency
  if (systemActive) {
    adaptiveFrequencyControl(currentTime);
  } else {
    ledcWrite(LEDC_CHANNEL, 0); // Silence buzzer
    currentFrequency = 0;
  }

  // Update LED
  updateLED(currentTime);

  // Send data to cloud
  if (currentTime - lastCloudUpdate >= CLOUD_INTERVAL) {
    sendDataToCloud();
    lastCloudUpdate = currentTime;
  }
}

// ===================== SENSOR FUNCTIONS =====================

/**
 * readLDR() - Reads light level from LDR sensor
 * Determines day/night based on threshold
 */
void readLDR() {
  ldrValue = analogRead(LDR_PIN);
  isNight = (ldrValue < LDR_THRESHOLD);

  // Debug output
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 2000) {
    Serial.print("LDR: ");
    Serial.print(ldrValue);
    Serial.print(" | Night: ");
    Serial.println(isNight ? "YES" : "NO");
    lastPrint = millis();
  }
}

/**
 * checkPIR() - Checks PIR sensor for motion
 * Records timestamps for activity analysis
 */
void checkPIR(unsigned long currentTime) {
  if (currentTime - lastMotionCheck < 100) return; // Debounce
  lastMotionCheck = currentTime;

  int pirState = digitalRead(PIR_PIN);
  motionDetected = (pirState == HIGH);

  if (motionDetected && systemActive) {
    // Record motion timestamp
    motionTimestamps[motionIndex % 20] = currentTime;
    motionIndex++;
    motionCount++;

    Serial.print("! Motion detected. Count: ");
    Serial.println(motionCount);
  }
}

/**
 * activityAnalysis() - Analyzes motion patterns
 * Determines if aggressive mode should be activated
 */
void activityAnalysis(unsigned long currentTime) {
  // Count recent motions within the analysis window
  int recentMotions = 0;
  for (int i = 0; i < 20; i++) {
    if (motionTimestamps[i] > 0 &&
        (currentTime - motionTimestamps[i]) < MOTION_WINDOW) {
      recentMotions++;
    }
  }

  // Activate aggressive mode if threshold exceeded
  bool wasAggressive = aggressiveMode;
  aggressiveMode = (recentMotions >= AGGRESSIVE_THRESHOLD);

  if (aggressiveMode && !wasAggressive) {
    Serial.println(">>> AGGRESSIVE MODE ACTIVATED <<<");
  } else if (!aggressiveMode && wasAggressive) {
    Serial.println("--- Normal mode restored ---");
  }
}

// ===================== FREQUENCY CONTROL =====================

/**
 * adaptiveFrequencyControl() - Dynamic frequency sweep
 * Uses LEDC for smooth PWM frequency transitions
 * Aggressive mode = faster, wider sweep
 */
void adaptiveFrequencyControl(unsigned long currentTime) {
  unsigned long stepTime = aggressiveMode ? 20 : FREQ_STEP_TIME;
  float stepSize = aggressiveMode ? 2000.0 : 500.0;

  if (currentTime - lastFreqChange < stepTime) return;
  lastFreqChange = currentTime;

  // Frequency sweep logic
  if (sweepUp) {
    currentFrequency += stepSize;
    if (currentFrequency >= FREQ_MAX) {
      currentFrequency = FREQ_MAX;
      sweepUp = false;
    }
  } else {
    currentFrequency -= stepSize;
    if (currentFrequency <= FREQ_MIN) {
      currentFrequency = FREQ_MIN;
      sweepUp = true;
    }
  }

  // Apply frequency to buzzer
  ledcSetup(LEDC_CHANNEL, (uint32_t)currentFrequency, LEDC_RESOLUTION);
  ledcWrite(LEDC_CHANNEL, LEDC_DUTY);
}

// ===================== LED CONTROL =====================

/**
 * updateLED() - Controls status LED
 * OFF = standby, ON = active, BLINK = motion detected
 */
void updateLED(unsigned long currentTime) {
  if (!systemActive) {
    digitalWrite(LED_PIN, LOW);
    return;
  }

  if (motionDetected) {
    // Blink LED
    if (currentTime - lastLedToggle >= LED_BLINK_RATE) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
      lastLedToggle = currentTime;
    }
  } else {
    // Solid ON
    digitalWrite(LED_PIN, HIGH);
  }
}

// ===================== CLOUD FUNCTIONS =====================

/**
 * connectWiFi() - Establishes WiFi connection
 */
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" Failed! Running offline.");
  }
}

/**
 * sendDataToCloud() - Sends telemetry to ThingSpeak
 * Fields: 1=Day/Night, 2=DemoMode, 3=MotionCount,
 *         4=Frequency, 5=SystemActive
 */
void sendDataToCloud() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Skipping upload.");
    return;
  }

  HTTPClient http;
  String url = String(thingSpeakURL);
  url += "?api_key=" + String(thingSpeakAPI);
  url += "&field1=" + String(isNight ? 1 : 0);
  url += "&field2=" + String(DEMO_MODE ? 1 : 0);
  url += "&field3=" + String(motionCount);
  url += "&field4=" + String((int)currentFrequency);
  url += "&field5=" + String(systemActive ? 1 : 0);

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode > 0) {
    Serial.print("Cloud update OK. Response: ");
    Serial.println(httpCode);
  } else {
    Serial.print("Cloud update failed: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();

  // Reset motion count after upload
  motionCount = 0;
}`;

export const PIN_TABLE = [
  { component: 'ESP32', pin: '3V3', connection: 'Power rail', notes: '3.3V power output' },
  { component: 'ESP32', pin: 'GND', connection: 'Ground rail', notes: 'Common ground' },
  { component: 'PIR Sensor', pin: 'VCC', connection: 'ESP32 3V3', notes: '3.3V power' },
  { component: 'PIR Sensor', pin: 'OUT', connection: 'ESP32 GPIO27', notes: 'Digital motion output' },
  { component: 'PIR Sensor', pin: 'GND', connection: 'ESP32 GND', notes: 'Ground' },
  { component: 'LDR Sensor', pin: 'Signal', connection: 'ESP32 GPIO34 (ADC1_CH6)', notes: 'Analog light level' },
  { component: 'LDR Sensor', pin: 'VCC', connection: 'ESP32 3V3', notes: 'Via 10kΩ voltage divider' },
  { component: 'LDR Sensor', pin: 'GND', connection: 'ESP32 GND', notes: 'Ground' },
  { component: 'Ultrasonic Buzzer', pin: '+', connection: 'ESP32 GPIO25', notes: 'PWM signal (LEDC CH0)' },
  { component: 'Ultrasonic Buzzer', pin: '-', connection: 'ESP32 GND', notes: 'Ground' },
  { component: 'Status LED', pin: 'Anode (+)', connection: 'ESP32 GPIO2', notes: 'Via 220Ω resistor' },
  { component: 'Status LED', pin: 'Cathode (-)', connection: 'ESP32 GND', notes: 'Ground' },
  { component: 'Power Supply', pin: '5V', connection: 'ESP32 VIN', notes: 'External 5V DC adapter' },
  { component: 'Power Supply', pin: 'GND', connection: 'ESP32 GND', notes: 'Common ground' },
];
