"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SKINS = [
  { src: "/skin-notsaywhat.png", fallback: "/avatar.png", name: "notsaywhat" },
  { src: "/skins/steve.png", fallback: "/skins/steve.png", name: "casual notsaywhat" },
  { src: "/skins/scientist.png", fallback: "/skins/scientist.png", name: "scientist notsaywhat" },
  { src: "/skins/research.png", fallback: "/skins/research.png", name: "research notsaywhat" },
  { src: "/skins/intern.png", fallback: "/skins/intern.png", name: "intern notsaywhat" },
  { src: "/skins/pianist.png", fallback: "/skins/pianist.png", name: "pianist notsaywhat" },
] as const;
const HIDDEN_SKIN = "/skins/hidden.png";

export default function HomeSkinViewer() {
  const { discover } = useEasterEggs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<{
    loadSkin: (source: string, options?: { model?: "default" | "slim" | "auto-detect" }) => Promise<void> | void;
  } | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [skinIndex, setSkinIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState<string>(SKINS[0].name);

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
        skin: SKINS[0].src,
        model: "default",
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
      viewerRef.current = viewer;

      cleanup = () => {
        viewerRef.current = null;
        viewer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const cycleSkin = () => {
    if (hidden) {
      discover("skin");
      return;
    }
    const nextIndex = skinIndex + 1;
    if (nextIndex >= SKINS.length) {
      setHidden(true);
      setName("???");
      void viewerRef.current?.loadSkin(HIDDEN_SKIN, { model: "default" });
      discover("skin");
      return;
    }
    const next = SKINS[nextIndex];
    setSkinIndex(nextIndex);
    setName(next.name);
    void viewerRef.current?.loadSkin(next.src, { model: "default" });
  };

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
    cycleSkin();
  };

  return (
    <aside className="home-player" aria-label="Minecraft profile: notsaywhat">
      <div className="home-player__name">{name}</div>
      <canvas
        ref={canvasRef}
        className="home-player__canvas"
        width={240}
        height={360}
        aria-label="Interactive 3D model of notsaywhat's Minecraft skin"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      <button
        type="button"
        className="home-player__fallback"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label="Cycle Minecraft skins"
      >
        <Image
          src={hidden ? HIDDEN_SKIN : SKINS[skinIndex].fallback}
          alt="Minecraft skin"
          width={64}
          height={64}
        />
      </button>
    </aside>
  );
}
