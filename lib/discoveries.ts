export const DISCOVERY_IDS = ["skin", "konami", "settings", "server", "gallery"] as const;
export type DiscoveryId = (typeof DISCOVERY_IDS)[number];

export type AdvancementFrame = "task" | "goal" | "challenge";

export const ADVANCEMENTS: Record<
  DiscoveryId,
  { header: string; name: string; icon: string; frame: AdvancementFrame }
> = {
  skin: {
    header: "Advancement Made!",
    name: "Skin Deep",
    icon: "/textures/advancements/skin.png",
    frame: "task",
  },
  konami: {
    header: "Advancement Made!",
    name: "How Did We Get Here?",
    icon: "/textures/advancements/konami.png",
    frame: "task",
  },
  settings: {
    header: "Goal Reached!",
    name: "Quake Pro",
    icon: "/textures/advancements/settings.png",
    frame: "goal",
  },
  server: {
    header: "Advancement Made!",
    name: "The Fifth Server",
    icon: "/textures/advancements/server.png",
    frame: "task",
  },
  gallery: {
    header: "Advancement Made!",
    name: "A Strange Photograph",
    icon: "/textures/advancements/gallery.png",
    frame: "task",
  },
};

export const CHALLENGE_COMPLETE = {
  header: "Challenge Complete!",
  name: "Cover Me With Discoveries",
  icon: "/textures/advancements/challenge.png",
  frame: "challenge" as const,
};

export function normalizeDiscoveries(value: unknown): DiscoveryId[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)].filter(
    (id): id is DiscoveryId =>
      typeof id === "string" && DISCOVERY_IDS.includes(id as DiscoveryId)
  );
}

export function addDiscovery(current: DiscoveryId[], id: DiscoveryId): DiscoveryId[] {
  return current.includes(id) ? current : [...current, id];
}

export function isSecretRoomUnlocked(found: DiscoveryId[]): boolean {
  return DISCOVERY_IDS.every((id) => found.includes(id));
}
