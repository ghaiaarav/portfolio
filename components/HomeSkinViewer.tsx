"use client";

import { useEffect, useRef } from "react";

export default function HomeSkinViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let cleanup = () => {};

    void import("skinview3d").then(({ IdleAnimation, SkinViewer }) => {
      if (disposed) return;

      const viewer = new SkinViewer({
        canvas,
        width: 240,
        height: 360,
        skin: "/skin-notsaywhat.png",
        model: "auto-detect",
        fov: 36,
        zoom: 0.82,
        enableControls: true,
      });

      viewer.animation = new IdleAnimation();
      viewer.animation.speed = 0.6;
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.25;
      viewer.controls.enablePan = false;
      viewer.controls.enableZoom = false;

      cleanup = () => viewer.dispose();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <aside className="home-player" aria-label="Minecraft profile: notsaywhat">
      <div className="home-player__name">notsaywhat</div>
      <canvas
        ref={canvasRef}
        className="home-player__canvas"
        width={240}
        height={360}
        aria-label="Interactive 3D model of notsaywhat's Minecraft skin"
      />
    </aside>
  );
}
