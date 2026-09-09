"use client";

import { McMenuGrid, type McMenuItem } from "@/components/mc/McMenuGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";

const OPTION_ROWS: McMenuItem[][] = [
  [
    { href: "/options/about", label: "Skin Customization" },
    { href: "/activities", label: "Music & Sounds" },
  ],
  [
    { href: "/options/statistics", label: "Video Settings" },
    { href: "/journey", label: "Language" },
  ],
  [
    { href: "/options/resource-packs", label: "Resource Packs" },
    { href: "/honors", label: "Shaders" },
  ],
  [
    { href: "/blog", label: "Record Screen" },
    { href: "/options/contact", label: "Controls" },
  ],
  [
    { href: "/options/contact", label: "Chat Settings" },
    { href: "https://github.com/ghaiaarav", label: "Open Debug Console", external: true },
  ],
];

export default function OptionsMenuClient() {
  return (
    <McMenuScreen title="Options" doneHref="/">
      <McMenuGrid rows={OPTION_ROWS} />
    </McMenuScreen>
  );
}
