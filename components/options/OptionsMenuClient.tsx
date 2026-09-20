"use client";

import McFovSlider from "@/components/mc/McFovSlider";
import { useMcGui } from "@/components/mc/McGuiProvider";
import McOptionButton from "@/components/mc/McOptionButton";
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
      { href: "/options/gallery?origin=options", label: "Photos" },
    ],
    [
      { href: "/options/statistics", label: "Statistics" },
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
      { href: "/options/resource-packs", label: "Resource Packs" },
      { href: "/options/accessibility", label: "Accessibility" },
    ],
  ];

  return (
    <McMenuScreen title="Options" doneHref="/">
      <McFovSlider />
      <div className="menu-buttons__row menu-buttons__row--single mc-options-dark">
        <McOptionButton
          label={darkMode ? "Dark Mode: ON" : "Dark Mode: OFF"}
          onClick={toggleDarkMode}
          size="full"
          ellipsis={false}
        />
      </div>
      <McMenuGrid rows={optionRows} />
    </McMenuScreen>
  );
}
