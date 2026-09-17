"use client";

import McFovSlider from "@/components/mc/McFovSlider";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { McMenuGrid, type McMenuItem } from "@/components/mc/McMenuGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";

export default function OptionsMenuClient() {
  const { darkMode, toggleDarkMode } = useMcGui();
  const optionRows: McMenuItem[][] = [
    [
      { href: "/options/about", label: "About Me" },
      { href: "/options/gallery", label: "Photos & Videos" },
    ],
    [
      { href: "/options/statistics", label: "Statistics" },
      { label: darkMode ? "Light Mode" : "Dark Mode", onClick: toggleDarkMode },
    ],
    [
      { href: "/options/resource-packs", label: "Resource Packs" },
      { href: "/honors", label: "Skills" },
    ],
    [
      { href: "/options/tba/record", label: "Record Screen" },
      { href: "/options/contact", label: "Contact me..!", ellipsis: false },
    ],
    [
      { href: "/options/tba/chat", label: "Chat Settings" },
      {
        href: "https://github.com/ghaiaarav/portfolio",
        label: "Open GitHub Repo..",
        external: true,
        ellipsis: false,
      },
    ],
  ];

  return (
    <McMenuScreen title="Options" doneHref="/">
      <McFovSlider />
      <McMenuGrid rows={optionRows} />
    </McMenuScreen>
  );
}
