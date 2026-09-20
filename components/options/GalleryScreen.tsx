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
    src: "/gallery/01-parents.jpg",
    title: "My parents",
    blurb: "The best company there can be!",
  },
  {
    src: "/gallery/02-minecraft-homies.jpg",
    title: "Minecraft with the homies",
    blurb: "Moments before disaster by phantom.",
  },
  {
    src: "/gallery/03-redbull-showrun.jpg",
    title: "@ the SF Red Bull showrun",
    blurb: "We saw Yuki Tsunoda on fire (literally)!",
  },
  {
    src: "/gallery/04-research-poster.jpg",
    title: "Dabbling in research",
    blurb: "Who knew space was kinda big?",
  },
  {
    src: "/gallery/05-meal-prep.jpg",
    title: "Weekly meal-prep",
    blurb: "Always iterating!",
  },
  {
    src: "/gallery/06-oscar.jpg",
    title: "Oscar the dog",
    blurb: "Upside-down greetings!",
    egg: true,
  },
  {
    src: "/gallery/07-volunteering.jpg",
    title: "Volunteering",
    blurb: "Giving back to the community :)",
  },
  {
    src: "/gallery/08-gym.png",
    title: "Pumping Iron",
    blurb: "Highschool gym sessions..",
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
      title={experience ? `${experience.company} Media` : "Photos"}
      doneHref={originHref(origin)}
      wide
    >
      <div className="mc-gallery">
        <p className="mc-gallery__intro">
          {experience
            ? "Click a still to open it full-screen. Personal photos can replace these placeholders."
            : "Click a photo to open a larger view and a short caption."}
        </p>
        <div className="mc-gallery__grid">
          {media.map((item, index) => (
            <button
              type="button"
              className={`mc-gallery__slot${item.egg ? " mc-gallery__slot--egg" : ""}`}
              key={`${item.src}-${item.title}`}
              onClick={() => openItem(item)}
            >
              <img src={item.src} alt="" />
              <span className="mc-gallery__caption">
                {String(index + 1).padStart(2, "0")} · {item.title}
              </span>
            </button>
          ))}
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
