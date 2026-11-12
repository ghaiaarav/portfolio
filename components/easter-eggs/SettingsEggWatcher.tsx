"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { useEffect } from "react";

export default function SettingsEggWatcher() {
  const { darkMode, fov } = useMcGui();
  const { discover, ready } = useEasterEggs();

  useEffect(() => {
    // Saved settings re-satisfy this on every page load, so only toast the first time.
    if (ready && darkMode && fov >= 110) discover("settings", { silentIfFound: true });
  }, [darkMode, discover, fov, ready]);

  return null;
}
