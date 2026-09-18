"use client";

import { McMenuGrid } from "@/components/mc/McMenuGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";
import { useMcGui } from "@/components/mc/McGuiProvider";
import { useState } from "react";

const SCALES = ["small", "normal", "large"] as const;

export default function AccessibilityScreen() {
  const {
    guiScale,
    setGuiScale,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    soundMuted,
    setSoundMuted,
    showToasts,
    setShowToasts,
  } = useMcGui();
  const [help, setHelp] = useState(false);

  const cycleScale = () => {
    const index = SCALES.indexOf(guiScale);
    setGuiScale(SCALES[(index + 1) % SCALES.length]);
  };

  return (
    <McMenuScreen title="Accessibility" doneHref="/options">
      <div className="mc-accessibility-grid">
        <McMenuGrid
          rows={[
            [
              { label: `GUI Scale: ${guiScale}`, onClick: cycleScale, ellipsis: false },
              { label: `Sound: ${soundMuted ? "OFF" : "ON"}`, onClick: () => setSoundMuted(!soundMuted), ellipsis: false },
            ],
            [
              { label: `High Contrast: ${highContrast ? "ON" : "OFF"}`, onClick: () => setHighContrast(!highContrast), ellipsis: false },
              { label: `Reduced Motion: ${reducedMotion ? "ON" : "OFF"}`, onClick: () => setReducedMotion(!reducedMotion), ellipsis: false },
            ],
            [
              { label: `Notifications: ${showToasts ? "ON" : "OFF"}`, onClick: () => setShowToasts(!showToasts), ellipsis: false },
              { label: "Keyboard Help", onClick: () => setHelp(!help), ellipsis: false },
            ],
          ]}
        />
      </div>
      {help && (
        <div className="mc-accessibility-help">
          <p><kbd>Tab</kbd> moves between controls; <kbd>Enter</kbd> activates them.</p>
          <p>Arrow keys adjust sliders. Escape or Done returns to the previous menu.</p>
          <p>Some old cheat codes may still work.</p>
        </div>
      )}
    </McMenuScreen>
  );
}
