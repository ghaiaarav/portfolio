"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import { originHref, type MenuOrigin } from "@/lib/menuNavigation";
import { useEffect, useState } from "react";

type GalleryItem = {
  src: string;
  title: string;
  blurb?: string;
  egg?: boolean;
};

type Experience = Portfolio["experience"][number];

const GENERAL_MEDIA: GalleryItem[] = [
  {
    src: "/avatar.png",
    title: "Portrait",
    blurb: "notsaywhat, the current main look. Click around the site the same way you'd click around a world.",
  },
  {
    src: "/resource-packs/mathematics.jpg",
    title: "Research",
    blurb: "Topology, graphs, and the notebooks that turn into papers. NSF-funded work lives here.",
  },
  {
    src: "/resource-packs/computer-science.jpg",
    title: "Projects",
    blurb: "LowLa, RIOT, telemetry tools, and the rest of the shipped worlds from Singleplayer.",
  },
  {
    src: "/activities/music/piano.jpg",
    title: "Piano",
    blurb: "Ballade No. 1 is in progress. Liebestraum No. 3 already made it onto the splash texts.",
  },
  {
    src: "/activities/travel/knoxville.jpg",
    title: "Travel",
    blurb: "Knoxville, summer 2025: Standard Precision Bellows, predictive maintenance, and Diet Coke.",
  },
  {
    src: "/activities/sciravens.webp",
    title: "Side Quests",
    blurb: "A leftover photograph from a side quest. Some pictures are just pictures. This one isn't.",
    egg: true,
  },
];

export default function GalleryScreen({
  experience,
  origin,
}: {
  experience?: Experience;
  origin: MenuOrigin;
}) {
  const { discover } = useEasterEggs();
  const media: GalleryItem[] = experience?.media?.map((item) => ({
    src: item.src,
    title: item.title,
    blurb: "blurb" in item && typeof item.blurb === "string"
      ? item.blurb
      : `${item.title}. Full-size stills and captions go here once the real photos land.`,
    egg: "egg" in item && Boolean(item.egg),
  })) ?? GENERAL_MEDIA;
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const openItem = (item: GalleryItem) => {
    setOpen(item);
    if (item.egg) discover("gallery");
  };

  return (
    <McMenuScreen
      title={experience ? `${experience.company} Media` : "Photos & Videos"}
      doneHref={originHref(origin)}
      wide
    >
      <div className="mc-gallery">
        <p className="mc-gallery__intro">
          {experience
            ? "Click a still to open it full-screen. Personal photos can replace these placeholders."
            : "Click a photo to open a larger view and a short caption. One of them is not like the others."}
        </p>
        <div className="mc-gallery__grid">
          {media.map((item, index) => (
            <button
              type="button"
              className="mc-gallery__slot"
              key={`${item.src}-${item.title}`}
              onClick={() => openItem(item)}
            >
              <img src={item.src} alt="" />
              <span className="mc-gallery__caption">
                {String(index + 1).padStart(2, "0")} · {item.title}
              </span>
            </button>
          ))}
          {!experience && <div className="mc-gallery__slot mc-gallery__slot--video">
            <span className="mc-gallery__placeholder" aria-hidden="true">▶</span>
            <span>Video · Featured</span>
          </div>}
          {!experience && <div className="mc-gallery__slot mc-gallery__slot--video">
            <span className="mc-gallery__placeholder" aria-hidden="true">▶</span>
            <span>Video · More</span>
          </div>}
        </div>
      </div>
      {open && (
        <div className="mc-lightbox" role="dialog" aria-modal="true" aria-label={open.title}>
          <button type="button" className="mc-lightbox__backdrop" onClick={() => setOpen(null)} aria-label="Close photo" />
          <div className="mc-lightbox__frame">
            <div className="mc-lightbox__photo">
              <img src={open.src} alt={open.title} />
            </div>
            <div className="mc-lightbox__copy">
              <strong>{open.title}</strong>
              <p>{open.blurb}</p>
            </div>
            <button type="button" className="mc-button" onClick={() => setOpen(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </McMenuScreen>
  );
}
