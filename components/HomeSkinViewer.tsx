"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import { useMcSound } from "@/hooks/useMcSound";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SKINS = [
  { src: "/skin-notsaywhat.png", fallback: "/avatar.png", name: "notsaywhat" },
  { src: "/skins/steve.png", fallback: "/skins/steve.png", name: "casual notsaywhat" },
  { src: "/skins/scientist.png", fallback: "/skins/scientist.png", name: "scientist notsaywhat" },
  { src: "/skins/finance.png", fallback: "/skins/finance.png", name: "finance bro notsaywhat" },
  { src: "/skins/intern.png", fallback: "/skins/intern.png", name: "intern notsaywhat" },
  { src: "/skins/pianist.png", fallback: "/skins/pianist.png", name: "pianist notsaywhat" },
] as const;
const HIDDEN_SKIN = "/skins/hidden.png";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function viewerSize() {
  if (typeof window === "undefined") return { width: 240, height: 360, mobile: false };
  if (window.matchMedia("(max-width: 600px)").matches) {
    return { width: 160, height: 240, mobile: true };
  }
  if (window.matchMedia("(max-width: 900px)").matches) {
    return { width: 128, height: 192, mobile: true };
  }
  return { width: 240, height: 360, mobile: false };
}

export default function HomeSkinViewer() {
  const { discover } = useEasterEggs();
  const { playClick, playThunder } = useMcSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<{
    width: number;
    height: number;
    loadSkin: (source: string, options?: { model?: "default" | "slim" | "auto-detect" }) => Promise<void> | void;
    dispose: () => void;
  } | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [skinIndex, setSkinIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState<string>(SKINS[0].name);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasWebGL()) {
      setUseFallback(true);
      return;
    }

    let disposed = false;
    let cleanup = () => {};
    const size = viewerSize();

    void import("skinview3d")
      .then(({ IdleAnimation, SkinViewer }) => {
        if (disposed || !canvasRef.current) return;

        const viewer = new SkinViewer({
          canvas: canvasRef.current,
          width: size.width,
          height: size.height,
          skin: SKINS[0].src,
          model: "default",
          fov: 36,
          zoom: 0.82,
          enableControls: !size.mobile,
        });

        viewer.animation = new IdleAnimation();
        viewer.animation.speed = 0.6;
        viewer.autoRotate = true;
        viewer.autoRotateSpeed = 0.25;
        viewer.controls.enablePan = false;
        viewer.controls.enableZoom = false;
        const controls = viewer.controls as typeof viewer.controls & { enableRotate?: boolean };
        if (size.mobile) controls.enableRotate = false;
        canvasRef.current.style.touchAction = size.mobile ? "pan-y" : "none";
        viewerRef.current = viewer;

        const onResize = () => {
          const next = viewerSize();
          viewer.width = next.width;
          viewer.height = next.height;
          const controls = viewer.controls as typeof viewer.controls & { enableRotate?: boolean };
          controls.enableRotate = !next.mobile;
          if (canvasRef.current) {
            canvasRef.current.style.touchAction = next.mobile ? "pan-y" : "none";
          }
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          window.removeEventListener("resize", onResize);
          viewerRef.current = null;
          viewer.dispose();
        };
      })
      .catch(() => {
        if (!disposed) setUseFallback(true);
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const cycleSkin = () => {
    if (hidden) {
      playThunder();
      discover("skin");
      return;
    }
    const nextIndex = skinIndex + 1;
    if (nextIndex >= SKINS.length) {
      playThunder();
      setHidden(true);
      setName("???");
      void viewerRef.current?.loadSkin(HIDDEN_SKIN, { model: "default" });
      discover("skin");
      return;
    }
    playClick();
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
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
    cycleSkin();
  };

  return (
    <aside className="home-player" aria-label="Minecraft profile: notsaywhat">
      <div className="home-player__name">{name}</div>
      <canvas
        ref={canvasRef}
        className={`home-player__canvas${useFallback ? " home-player__canvas--hidden" : ""}`}
        width={240}
        height={360}
        aria-label="Interactive 3D model of notsaywhat's Minecraft skin"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      {useFallback && (
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
      )}
    </aside>
  );
}
