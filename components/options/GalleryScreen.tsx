"use client";

import { useDiscoveries } from "@/components/easter-eggs/EasterEggProvider";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { GalleryItem } from "@/lib/portfolio";
import Image from "next/image";

export default function GalleryScreen({
  title = "Photos & Videos",
  intro = "Gallery slots are ready. Add media when available.",
  items,
  doneHref,
}: {
  title?: string;
  intro?: string;
  items: GalleryItem[];
  doneHref: string;
}) {
  const { discover } = useDiscoveries();

  return (
    <McMenuScreen title={title} doneHref={doneHref} wide>
      <div className="mc-gallery">
        <p className="mc-gallery__intro">{intro}</p>
        <div className="mc-gallery__grid">
          {items.map((item, index) => (
            <button
              type="button"
              className={`mc-gallery__slot${item.kind === "video" ? " mc-gallery__slot--video" : ""}`}
              key={item.id}
              onClick={() => {
                if (item.easterEgg) {
                  discover("gallery-photo", "There was more in that photo than pixels.");
                }
              }}
            >
              {item.src ? (
                item.kind === "video" ? (
                  <video src={item.src} muted playsInline preload="metadata" />
                ) : (
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 520px) 45vw, 220px" />
                )
              ) : (
                <span className="mc-gallery__placeholder" aria-hidden="true">
                  {item.kind === "video" ? "▶" : "▧"}
                </span>
              )}
              <span className="mc-gallery__label">
                {String(index + 1).padStart(2, "0")} · {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </McMenuScreen>
  );
}
