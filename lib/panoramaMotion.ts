// Camera motion for the title-screen panorama, modelled on Minecraft's
// PanoramaRenderer: yaw advances 0.1° per tick (20 ticks/s, so a full turn
// takes three minutes) and pitch sways slowly around a fixed tilt.

const TICKS_PER_SECOND = 20;
const YAW_DEG_PER_TICK = 0.1;
const PITCH_SWAY_DEG = 5;
const PITCH_SWAY_RATE = 0.001; // radians per tick
export const PANORAMA_BASE_PITCH_DEG = 8;

/** Blurriness used behind every menu except the title screen (three.js 0..1 scale). */
export const MENU_BLUR = 0.16;

export function panoramaAngles(seconds: number): { yawDeg: number; pitchDeg: number } {
  const ticks = seconds * TICKS_PER_SECOND;
  return {
    yawDeg: -ticks * YAW_DEG_PER_TICK,
    pitchDeg: Math.sin(ticks * PITCH_SWAY_RATE) * PITCH_SWAY_DEG + PANORAMA_BASE_PITCH_DEG,
  };
}

/** Map the Options FOV slider (Minecraft's 30-110) onto the panorama camera; Normal (70) gives Minecraft's 85°. */
export function panoramaFov(optionFov: number): number {
  return Math.min(130, Math.max(45, optionFov + 15));
}

/** Frame-rate independent exponential ease toward a target (tau in seconds). */
export function easeToward(current: number, target: number, dtSeconds: number, tau = 0.12): number {
  if (dtSeconds <= 0) return current;
  const next = target + (current - target) * Math.exp(-dtSeconds / tau);
  return Math.abs(next - target) < 1e-4 ? target : next;
}
