export const MENU_ORIGINS = ["home", "options", "experience"] as const;

export type MenuOrigin = (typeof MENU_ORIGINS)[number];

export function parseMenuOrigin(value: string | string[] | undefined): MenuOrigin {
  const candidate = Array.isArray(value) ? value[0] : value;
  return MENU_ORIGINS.includes(candidate as MenuOrigin)
    ? (candidate as MenuOrigin)
    : "options";
}

export function originHref(origin: MenuOrigin): string {
  if (origin === "experience") return "/experience";
  if (origin === "home") return "/";
  return "/options";
}

/**
 * The in-app history trail is the list of pathnames for the history entries
 * behind the current one, oldest first. When a Done target is on the trail,
 * going back that many steps (instead of pushing) keeps the phone back gesture
 * from reopening menus the visitor already closed.
 */
export function stepsBackTo(trail: readonly string[], href: string): number | null {
  if (href.includes("?") || href.includes("#")) return null;
  const index = trail.lastIndexOf(href);
  return index < 0 ? null : trail.length - index;
}

export function trailAfterBack(trail: readonly string[], steps: number): string[] {
  return trail.slice(0, Math.max(0, trail.length - steps));
}
