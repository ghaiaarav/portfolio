"use client";

import { ConfirmLink } from "@/components/ExternalConfirmProvider";
import { McTab } from "@/components/McButton";
import PixelIcon from "@/components/PixelIcon";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";
import { useMemo, useState } from "react";

type Tab = "reading" | "music" | "movies" | "travel" | "sideQuests";

const QUEST_VISUALS: Record<string, { src: string; alt: string; contain?: boolean }> = {
  "hypixel-skyblock": {
    src: "/activities/skycofl.png",
    alt: "SkyCofl gold block",
    contain: true,
  },
  "ftc-sciravens": {
    src: "/activities/sciravens.webp",
    alt: "SciRavens FTC Team 23287 logo",
  },
};

const READING_VISUALS: Record<string, string> = {
  "The Psychology of Money": "/activities/reading/psychology-of-money.jpg",
  "Nonlinear Dynamics and Chaos": "/activities/reading/nonlinear-dynamics.jpg",
  "The Trachtenberg Speed System of Basic Mathematics": "/activities/reading/trachtenberg.jpg",
  "The Republic": "/activities/reading/republic.jpg",
  "Topology NOW!": "/activities/reading/topological-manifolds.jpg",
  "Algebraic Topology": "/resource-packs/mathematics.jpg",
  Discourses: "/activities/reading/discourses.jpg",
  "The Art and Craft of Problem Solving": "/activities/reading/trachtenberg.jpg",
};

const MUSIC_VISUALS: Record<string, string> = {
  "Ballade No. 1 in G minor, Op. 23": "/activities/music/chopin.jpg",
  "Liebestraum No. 3 in A-flat major": "/activities/music/liszt.jpg",
  "Piano performance recordings": "/activities/music/piano.jpg",
};

const MOVIE_VISUALS: Record<string, string> = {
  Oppenheimer: "/activities/movies/oppenheimer.png",
  "The Godfather": "/activities/movies/godfather.png",
  Seven: "/activities/movies/seven.png",
  Interstellar: "/activities/movies/interstellar.png",
};

function ActivityThumbnail({ src, alt, poster }: { src?: string; alt: string; poster?: boolean }) {
  return (
    <span className={`mc-row__thumbnail${poster ? " mc-row__thumbnail--poster" : ""}`}>
      {src ? <Image src={src} alt={alt} fill sizes={poster ? "48px" : "64px"} unoptimized /> : <span aria-hidden="true">▣</span>}
    </span>
  );
}

const READING_ORDER: Record<Portfolio["activities"]["reading"][number]["status"], number> = {
  reading: 0,
  queue: 1,
  coursework: 2,
  finished: 3,
};

const STATUS_LABEL: Record<Portfolio["activities"]["reading"][number]["status"], string> = {
  reading: "reading",
  queue: "on the shelf",
  coursework: "coursework",
  finished: "finished",
};

const PIECE_STATUS: Record<NonNullable<Portfolio["activities"]["music"][number]["status"]>, string> = {
  learning: "learning",
  planned: "up next",
  recorded: "recorded",
  "coming-soon": "videos coming soon",
};

export default function ActivitiesClient({
  activities,
  initialTab = "sideQuests",
  title = "Extracurriculars",
  doneHref = "/",
}: {
  activities: Portfolio["activities"];
  initialTab?: Tab;
  title?: string;
  doneHref?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "reading", label: "Reading" },
    { id: "music", label: "Music" },
    { id: "movies", label: "Movies" },
    { id: "travel", label: "Travel" },
    { id: "sideQuests", label: "Side Quests" },
  ];

  const reading = useMemo(
    () =>
      [...activities.reading].sort(
        (a, b) => READING_ORDER[a.status] - READING_ORDER[b.status] || a.title.localeCompare(b.title)
      ),
    [activities.reading]
  );

  const sideQuests = activities.sideQuests ?? [];

  return (
    <McMenuScreen title={title} doneHref={doneHref} wide>
      <div className="mc-menu-content mc-activities-content">
        <div className="mc-tabs">
          {tabs.map((t) => (
            <McTab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </McTab>
          ))}
        </div>

        {tab === "reading" &&
          reading.map((book) => (
            <div key={`${book.title}-${book.author}`} className="mc-row" style={{ cursor: "default" }}>
              <ActivityThumbnail
                src={READING_VISUALS[book.title]}
                alt={`${book.title} cover`}
              />
              <div className="mc-row__main">
                <div className="mc-row__title">
                  <PixelIcon name={book.status === "finished" ? "check" : book.status === "reading" ? "book" : "books"} />
                  {book.title}
                </div>
                <div className="mc-row__sub">
                  {book.author}
                  {book.category ? ` · ${book.category}` : ""}
                </div>
              </div>
              <div className="mc-row__meta">{STATUS_LABEL[book.status]}</div>
            </div>
          ))}

        {tab === "music" &&
          activities.music.map((m) => (
            <div key={`${m.album}-${m.artist}`} className="mc-row" style={{ cursor: "default" }}>
              <ActivityThumbnail
                src={MUSIC_VISUALS[m.album]}
                alt={`${m.artist} portrait`}
              />
              <div className="mc-row__main">
                <div className="mc-row__title">
                  <PixelIcon name={m.kind === "performance" ? "piano" : "note"} />
                  {m.album}
                </div>
                <div className="mc-row__sub">
                  {m.artist}
                  {m.status && m.kind === "performance" ? ` · ${PIECE_STATUS[m.status]}` : ""}
                </div>
              </div>
              {m.url ? (
                <ConfirmLink href={m.url} className="news-widget__link">
                  YouTube
                </ConfirmLink>
              ) : m.status === "coming-soon" ? (
                <span className="mc-row__meta">soon</span>
              ) : null}
            </div>
          ))}

        {tab === "movies" &&
          activities.movies.map((m) => (
            <div key={m.title} className="mc-row" style={{ cursor: "default" }}>
              <ActivityThumbnail
                src={MOVIE_VISUALS[m.title]}
                alt={`${m.title} poster`}
                poster
              />
              <div className="mc-row__main">
                <div className="mc-row__title">
                  <PixelIcon name="movie" />
                  {m.title}
                </div>
                <div className="mc-row__sub">
                  d. {m.director}, {m.year}
                </div>
              </div>
            </div>
          ))}

        {tab === "travel" &&
          activities.travel.map((t) => (
            <div key={t.place} className="mc-row" style={{ cursor: "default" }}>
              <ActivityThumbnail
                src={
                  t.place.startsWith("Knoxville")
                    ? "/activities/travel/knoxville.jpg"
                    : "/activities/travel/san-jose.jpg"
                }
                alt={t.place}
              />
              <div className="mc-row__main">
                <div className="mc-row__title">
                  <PixelIcon name="globe" />
                  {t.place}
                </div>
                <div className="mc-row__sub">{t.note}</div>
              </div>
              <div className="mc-row__meta">{t.date}</div>
            </div>
          ))}

        {tab === "sideQuests" &&
          <div className="side-quest-grid">
            {sideQuests.map((quest) => {
              const visual = QUEST_VISUALS[quest.id];
              const expanded = expandedQuest === quest.id;

              return (
                <article
                  key={quest.id}
                  className={`side-quest-card${expanded ? " side-quest-card--expanded" : ""}`}
                >
                  <button
                    type="button"
                    className="side-quest-card__toggle"
                    aria-expanded={expanded}
                    onClick={() => setExpandedQuest(expanded ? null : quest.id)}
                  >
                    <span className="side-quest-card__visual">
                      {visual && (
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          fill
                          sizes="(max-width: 640px) 90vw, 300px"
                          className={visual.contain ? "side-quest-card__image--contain" : ""}
                        />
                      )}
                    </span>
                    <span className="side-quest-card__summary">
                      <strong>{quest.title}</strong>
                      <span>{quest.achievement}</span>
                      <span className="side-quest-card__prompt">
                        {expanded ? "Close details" : "Open details"} ▸
                      </span>
                    </span>
                  </button>

                  {expanded && (
                    <div className="side-quest-card__details">
                      <p>{quest.description}</p>
                      {quest.skills && (
                        <div className="side-quest-row__tags">
                          {quest.skills.map((skill) => (
                            <span key={skill} className="mc-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {quest.links?.map((link) =>
                        link.url.includes("PASTE_") ? null : (
                          <ConfirmLink
                            key={link.label}
                            href={link.url}
                            className="news-widget__link side-quest-row__link"
                          >
                            {link.label} →
                          </ConfirmLink>
                        )
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>}
      </div>
    </McMenuScreen>
  );
}
