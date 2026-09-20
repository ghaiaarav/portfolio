export const PACK_IDS = ["vanilla", "defrosted", "frosted", "beach", "nether", "end"] as const;
export type PackId = (typeof PACK_IDS)[number];

export type PackInfo = {
  id: PackId;
  name: string;
  description: string;
  icon: string;
  folder: string;
};

export const PACKS: PackInfo[] = [
  {
    id: "vanilla",
    name: "Vanilla",
    description: "Classic overworld skies and stone buttons.",
    icon: "/panorama/0.png",
    folder: "panorama",
  },
  {
    id: "defrosted",
    name: "Defrosted",
    description: "Cherry grove pinks, inspired by Looshy's pack.",
    icon: "/panorama-defrosted/0.png",
    folder: "panorama-defrosted",
  },
  {
    id: "frosted",
    name: "Frosted",
    description: "Snow, ice spikes, and winter air.",
    icon: "/panorama-frosted/0.png",
    folder: "panorama-frosted",
  },
  {
    id: "beach",
    name: "Beach",
    description: "Warm sand, water, and a late-afternoon sun.",
    icon: "/panorama-beach/0.png",
    folder: "panorama-beach",
  },
  {
    id: "nether",
    name: "Nether",
    description: "Netherrack cliffs under a crimson roof.",
    icon: "/panorama-nether/0.png",
    folder: "panorama-nether",
  },
  {
    id: "end",
    name: "The End",
    description: "Void, chorus, and pale end stone islands.",
    icon: "/panorama-end/0.png",
    folder: "panorama-end",
  },
];

export function isPackId(value: string | null | undefined): value is PackId {
  return PACK_IDS.includes(value as PackId);
}

export function panoramaFolder(pack: PackId, darkMode: boolean): string {
  if (pack === "vanilla") return darkMode ? "panorama-night" : "panorama";
  const info = PACKS.find((item) => item.id === pack);
  return info?.folder ?? "panorama";
}
