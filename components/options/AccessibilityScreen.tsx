"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { useMcGui } from "@/components/mc/McGuiProvider";

function ToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <button type="button" className="mc-settings-option" onClick={() => onToggle(!enabled)}>
      {label}: <span className={enabled ? "mc-value-on" : "mc-value-off"}>{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}

export default function AccessibilityScreen() {
  const {
    soundEnabled,
    setSoundEnabled,
    guiScale,
    setGuiScale,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    showToasts,
    setShowToasts,
  } = useMcGui();

  return (
    <McMenuScreen title="Accessibility" doneHref="/options" wide>
      <div className="mc-accessibility-panel">
        <label className="mc-accessibility-slider">
          <span>GUI Scale: {Math.round(guiScale * 100)}%</span>
          <input
            type="range"
            min="85"
            max="125"
            step="5"
            value={Math.round(guiScale * 100)}
            onChange={(event) => setGuiScale(Number(event.target.value) / 100)}
          />
        </label>
        <div className="mc-settings-grid">
          <ToggleRow label="UI Sounds" enabled={soundEnabled} onToggle={setSoundEnabled} />
          <ToggleRow label="Reduced Motion" enabled={reducedMotion} onToggle={setReducedMotion} />
          <ToggleRow label="High Contrast" enabled={highContrast} onToggle={setHighContrast} />
          <ToggleRow label="Advancement Toasts" enabled={showToasts} onToggle={setShowToasts} />
        </div>
        <div className="mc-keyboard-help">
          <strong>Keyboard Controls</strong>
          <span>Tab: move focus · Enter/Space: activate · Arrow keys: adjust sliders</span>
        </div>
      </div>
    </McMenuScreen>
  );
}
