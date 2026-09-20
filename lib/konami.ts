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

export type SwipeDir = (typeof KONAMI_SWIPES)[number];

export function nextSequenceIndex(position: number, token: string, sequence: readonly string[]): number {
  if (token === sequence[position]) return position + 1;
  return token === sequence[0] ? 1 : 0;
}

export function swipeDirection(dx: number, dy: number, minDistance = 40): SwipeDir | null {
  if (Math.hypot(dx, dy) < minDistance) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}
