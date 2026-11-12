export const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export const KONAMI_SWIPES = [
  "up",
  "up",
  "down",
  "down",
  "left",
  "right",
  "left",
  "right",
] as const;

export const KONAMI_IDLE_MS = 1500;
export const SWIPE_MIN_DISTANCE = 40;
export const SWIPE_MAX_DISTANCE = 240;
export const SWIPE_MAX_MS = 500;

export type SwipeDir = (typeof KONAMI_SWIPES)[number];

/**
 * Advance a sequence matcher. On a mismatch, fall back to the longest prefix of
 * `sequence` that is still a suffix of what was typed, so "up up up down ..."
 * keeps its progress instead of restarting at 1.
 */
export function nextSequenceIndex(position: number, token: string, sequence: readonly string[]): number {
  if (token === sequence[position]) return position + 1;
  const typed = [...sequence.slice(0, position), token];
  for (let length = Math.min(position, sequence.length - 1); length > 0; length -= 1) {
    const tail = typed.slice(typed.length - length);
    if (tail.every((t, i) => t === sequence[i])) return length;
  }
  return 0;
}

export function swipeDirection(dx: number, dy: number, minDistance = SWIPE_MIN_DISTANCE): SwipeDir | null {
  if (Math.hypot(dx, dy) < minDistance) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

export function isKonamiIgnoredTarget(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !(target instanceof Element)) return false;
  return Boolean(target.closest("a, button, input, textarea, select, [role=slider], canvas"));
}

export function classifyFlick(
  dx: number,
  dy: number,
  dt: number,
  scrollDelta: number
): SwipeDir | null {
  if (Math.abs(scrollDelta) > 2) return null;
  if (dt <= 0 || dt > SWIPE_MAX_MS) return null;
  const dist = Math.hypot(dx, dy);
  if (dist < SWIPE_MIN_DISTANCE || dist > SWIPE_MAX_DISTANCE) return null;
  return swipeDirection(dx, dy, SWIPE_MIN_DISTANCE);
}
