"use client";

import { useMcGui } from "@/components/mc/McGuiProvider";
import type { PanoramaSettings } from "@/components/panorama/createPanoramaEngine";
import { panoramaFolder } from "@/lib/packs";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function supportsWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * The rotating title-screen panorama. A static face (styled from the
 * pre-paint data-theme/data-pack attributes, so it never flashes the wrong
 * world) shows until the WebGL skybox is ready, then the skybox fades in.
 * The title screen is sharp; every other screen blurs and dims it, like
 * Minecraft 1.21 menus.
 */
export default function PanoramaBackground() {
  const { darkMode, reducedMotion, pack, fov } = useMcGui();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const isTitle = pathname === "/";

  const settings: PanoramaSettings = {
    folder: panoramaFolder(pack, darkMode),
    isTitle,
    reducedMotion,
    fov,
    nightTint: darkMode && pack !== "vanilla",
  };
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !supportsWebGL()) return;
    let disposed = false;
    let engine: { dispose: () => void } | null = null;
    void Promise.all([import("three"), import("@/components/panorama/createPanoramaEngine")])
      .then(([THREE, { createPanoramaEngine }]) => {
        if (disposed) return;
        engine = createPanoramaEngine(THREE, canvas, () => settingsRef.current, () => {
          if (!disposed) setReady(true);
        });
      })
      .catch(() => {
        // Keep the static fallback.
      });
    return () => {
      disposed = true;
      engine?.dispose();
    };
  }, []);

  return (
    <div
      className={`panorama-wrap${ready ? " panorama-wrap--ready" : ""}${isTitle ? " panorama-wrap--title" : " panorama-wrap--menu"}`}
      aria-hidden="true"
    >
      <div className="panorama-fallback" />
      <canvas ref={canvasRef} className="panorama-canvas" />
      <div className="panorama-overlay" />
    </div>
  );
}
