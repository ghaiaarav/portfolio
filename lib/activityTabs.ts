export const ACTIVITY_TABS = ["reading", "music", "movies", "travel", "sideQuests"] as const;
export type ActivityTab = (typeof ACTIVITY_TABS)[number];

export function isActivityTab(value: unknown): value is ActivityTab {
  return typeof value === "string" && (ACTIVITY_TABS as readonly string[]).includes(value);
}
