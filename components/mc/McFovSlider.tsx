"use client";

import { fovLabel, useMcGui } from "@/components/mc/McGuiProvider";
import { useMcSound } from "@/hooks/useMcSound";
import { useCallback, useRef } from "react";

const MIN = 30;
const MAX = 110;

export default function McFovSlider() {
  const { fov, setFov } = useMcGui();
  const { playClick } = useMcSound();
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const value = Math.round(MIN + ratio * (MAX - MIN));
      setFov(value);
    },
    [setFov]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    playClick();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromClientX(e.clientX);
  };

  const ratio = (fov - MIN) / (MAX - MIN);

  return (
    <div className="mc-fov-slider">
      <div
        ref={trackRef}
        className="mc-fov-slider__track"
        role="slider"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={fov}
        aria-label="Field of view"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <span className="mc-fov-slider__label">
          FOV: {fovLabel(fov)}
        </span>
        <span
          className="mc-fov-slider__handle"
          style={{ left: `calc(${ratio * 100}% - 4px)` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
