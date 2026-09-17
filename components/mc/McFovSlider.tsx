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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    playClick();
    e.currentTarget.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFromClientX(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setFov(fov + (e.key === "ArrowRight" ? 1 : -1));
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
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <span className="mc-fov-slider__label">
          FOV: {fovLabel(fov)}
        </span>
        <span
          className="mc-fov-slider__handle"
          style={{
            left: `${ratio * 100}%`,
            transform: `translateX(${-ratio * 22}px)`,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
