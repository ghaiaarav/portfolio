export const LOG_ICONS = ["world", "map", "chest", "book", "compass", "torch"] as const;
export type LogIcon = (typeof LOG_ICONS)[number];

export function loreForCommit(message: string): { lore: string; icon: LogIcon } {
  const text = message.toLowerCase();
  if (/fix|bug|error|type|lint/.test(text)) {
    return { lore: "A crack in the cobble was sealed.", icon: "torch" };
  }
  if (/skin|player|steve/.test(text)) {
    return { lore: "A new guise walks the overworld.", icon: "chest" };
  }
  if (/pack|theme|pano|gui|menu|option/.test(text)) {
    return { lore: "The world was reskinned in fresh wool.", icon: "map" };
  }
  if (/secret|easter|konami|egg/.test(text)) {
    return { lore: "A hidden chamber whispered its name.", icon: "compass" };
  }
  if (/log|docs|readme|copy/.test(text)) {
    return { lore: "The village chronicler inked another page.", icon: "book" };
  }
  if (/add|feat|build|create/.test(text)) {
    return { lore: "New blocks were placed in the world.", icon: "world" };
  }
  return { lore: "The world ticked forward, as it always does.", icon: "world" };
}
