// Simulated IoT data engine for the pest repeller dashboard

export interface SystemState {
  isNight: boolean;
  demoMode: boolean;
  systemActive: boolean;
  motionDetected: boolean;
  motionCount: number;
  currentFrequency: number;
  ledState: 'off' | 'on' | 'blinking';
  ldrValue: number;
  pirTriggered: boolean;
  aggressiveMode: boolean;
  timestamp: number;
}

export interface MotionEvent {
  timestamp: number;
  count: number;
}

const LDR_THRESHOLD = 500;

export function createInitialState(): SystemState {
  return {
    isNight: true,
    demoMode: true,
    systemActive: true,
    motionDetected: false,
    motionCount: 0,
    currentFrequency: 25000,
    ledState: 'on',
    ldrValue: 200,
    pirTriggered: false,
    aggressiveMode: false,
    timestamp: Date.now(),
  };
}

export function simulateTick(prev: SystemState): SystemState {
  const state = { ...prev, timestamp: Date.now() };

  // Simulate LDR fluctuation
  state.ldrValue = Math.max(50, Math.min(950, state.ldrValue + (Math.random() - 0.5) * 40));
  state.isNight = state.ldrValue < LDR_THRESHOLD;

  // System active logic
  state.systemActive = state.demoMode || state.isNight;

  // Simulate random PIR triggers
  const motionChance = Math.random();
  state.pirTriggered = motionChance < 0.15;

  if (state.pirTriggered && state.systemActive) {
    state.motionDetected = true;
    state.motionCount = Math.min(state.motionCount + 1, 99);
    state.aggressiveMode = state.motionCount > 3;
  } else {
    state.motionDetected = false;
    // Decay motion count slowly
    if (Math.random() < 0.05 && state.motionCount > 0) {
      state.motionCount -= 1;
    }
    if (state.motionCount <= 1) state.aggressiveMode = false;
  }

  // Frequency logic
  if (!state.systemActive) {
    state.currentFrequency = 0;
  } else if (state.aggressiveMode) {
    // Aggressive sweep
    state.currentFrequency = 20000 + Math.random() * 40000;
  } else if (state.motionDetected) {
    // Moderate frequency
    state.currentFrequency = 25000 + Math.random() * 10000;
  } else {
    // Idle sweep
    state.currentFrequency = 22000 + Math.sin(Date.now() / 2000) * 3000;
  }

  // LED logic
  if (!state.systemActive) {
    state.ledState = 'off';
  } else if (state.motionDetected) {
    state.ledState = 'blinking';
  } else {
    state.ledState = 'on';
  }

  return state;
}
