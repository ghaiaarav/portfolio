"use client";

import McFovSlider from "@/components/mc/McFovSlider";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { McMenuGrid, type McMenuItem } from "@/components/mc/McMenuGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { MenuOrigin } from "@/lib/menuNavigation";

export default function OptionsMenuClient({
  attention,
  origin,
}: {
  attention?: string;
  origin: MenuOrigin;
}) {
  const { darkMode, toggleDarkMode } = useMcGui();
  const optionRows: McMenuItem[][] = [
    [
      { href: "/options/about", label: "About Me" },
      { href: "/options/gallery?origin=options", label: "Photos & Videos" },
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
      { href: "/logs", label: "Logs" },
      {
        href: `/options/contact?origin=${origin}`,
        label: "Contact me..!",
        ellipsis: false,
        className: attention === "contact" ? "mc-button--attention" : undefined,
      },
    ],
    [
      { href: "/options/accessibility", label: "Accessibility" },
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
