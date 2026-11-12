export const LOG_ICONS = ["world", "map", "chest", "book", "compass", "torch"] as const;
export type LogIcon = (typeof LOG_ICONS)[number];

export function loreForCommit(message: string): { lore: string; icon: LogIcon } {
  const text = message.toLowerCase();
  if (/fix|bug|error|type|lint/.test(text)) {
    return { lore: "Patched a hole in the cobble.", icon: "torch" };
  }
  if (/skin|player|steve/.test(text)) {
    return { lore: "Crafted another player head.", icon: "chest" };
  }
  if (/pack|theme|pano|gui|menu|option/.test(text)) {
    return { lore: "Applied a resource pack. Dirt looks different now.", icon: "map" };
  }
  if (/secret|easter|konami|egg/.test(text)) {
    return { lore: "Found a chest that wasn't on the map.", icon: "compass" };
  }
  if (/log|docs|readme|copy|resume/.test(text)) {
    return { lore: "Wrote another page in the written book.", icon: "book" };
  }
  if (/add|feat|build|create/.test(text)) {
    return { lore: "Placed more blocks than the hotbar could hold.", icon: "world" };
  }
  return { lore: "The world ticked. Nothing exploded. Probably.", icon: "world" };
}
