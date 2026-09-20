"use client";

import { useMcGui } from "@/components/mc/McGuiProvider";
import { panoramaFolder } from "@/lib/packs";
import { useEffect, useState } from "react";

const FACES = [0, 1, 2, 3, 4, 5];

export default function PanoramaBackground() {
  const { darkMode, reducedMotion, pack } = useMcGui();
  const [ready, setReady] = useState(false);
  const folder = panoramaFolder(pack, darkMode);
  const nightTint = darkMode && pack !== "vanilla";

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    Promise.all(
      FACES.map(
        (face) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error(`Failed panorama face ${face}`));
            image.src = `/${folder}/${face}.png`;
          })
      )
    )
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setReady(false));
    return () => {
      cancelled = true;
    };
  }, [folder]);

  return (
    <div
      className={`panorama-wrap${ready ? " panorama-wrap--ready" : ""}${nightTint ? " panorama-wrap--night-tint" : ""}`}
      aria-hidden="true"
    >
      <div
        className="panorama-fallback"
        style={{ backgroundImage: `url(/${folder}/0.png)` }}
      />
      <div className={`panorama-scene${reducedMotion ? " panorama-scene--still" : ""}`}>
        <div className="panorama-blur">
          <div className="panorama-cube">
            {FACES.map((i) => (
              <div
                key={i}
                className={`panorama-face panorama-face--${i}`}
                style={{
                  backgroundImage: `url(/${folder}/${i}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
