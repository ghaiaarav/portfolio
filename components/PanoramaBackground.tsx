"use client";

import { useMcGui } from "@/components/mc/McGuiProvider";

export default function PanoramaBackground() {
  const { darkMode } = useMcGui();
  const faces = [0, 1, 2, 3, 4, 5];
  return (
    <div className="panorama-wrap" aria-hidden="true">
      <div className="panorama-scene">
        <div className="panorama-blur">
          <div className="panorama-cube">
            {faces.map((i) => (
              <div
                key={i}
                className={`panorama-face panorama-face--${i}`}
                style={{
                  backgroundImage: `url(/${darkMode ? "panorama-night" : "panorama"}/${i}.png)`,
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
