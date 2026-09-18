"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { useEffect } from "react";

export default function SettingsEggWatcher() {
  const { darkMode, fov } = useMcGui();
  const { discover } = useEasterEggs();

  useEffect(() => {
    if (darkMode && fov >= 110) discover("settings");
  }, [darkMode, discover, fov]);

  return null;
}
