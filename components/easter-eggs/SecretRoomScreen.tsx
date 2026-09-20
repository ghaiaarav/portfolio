"use client";

import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import McMenuScreen from "@/components/mc/McMenuScreen";
import { useMcSound } from "@/hooks/useMcSound";
import { useEffect, useState } from "react";

const ALBUM = [
  {
    src: "/secret-room/01-nutella.jpg",
    title: "My first (and everlasting) love..",
  },
  {
    src: "/secret-room/02-tattoo.jpg",
    title: "No regrets!",
  },
  {
    src: "/secret-room/03-favourite-person.jpg",
    title: "Me and my favourite person in the world :)",
  },
  {
    src: "/secret-room/04-cousins.jpg",
    title: "My cousins clearly love me..",
  },
  {
    src: "/secret-room/05-oscar.jpg",
    title: "A much younger Oscar.",
  },
] as const;

export default function SecretRoomScreen() {
  const { found, complete } = useEasterEggs();
  const { playClick } = useMcSound();
  const [open, setOpen] = useState<(typeof ALBUM)[number] | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <McMenuScreen title={complete ? "Secret Room" : "Locked Room"} doneHref="/" wide>
      <div className="mc-secret-room">
        {complete ? (
          <>
            <div className="mc-secret-credits">
              <h2>The Secret Room</h2>
              <p>Built by Aarav Ghai</p>
              <p>Inspired by classic Minecraft interfaces and my own life experiences.</p>
              <p>Thanks for looking closely enough to find everything :D</p>
            </div>
            <div className="mc-gallery mc-secret-album">
              <p className="mc-gallery__intro">A few photos, in order.</p>
              <div className="mc-gallery__grid mc-secret-album__grid">
                {ALBUM.map((item, index) => (
                  <button
                    type="button"
                    className="mc-gallery__slot"
                    key={item.src}
                    onClick={() => {
                      playClick();
                      setOpen(item);
                    }}
                  >
                    <img src={item.src} alt="" />
                    <span className="mc-gallery__caption">
                      {String(index + 1).padStart(2, "0")} · {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="mc-secret-locked">
            Find all five discoveries to open this room. Current count: {found.length}/5
          </p>
        )}
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
