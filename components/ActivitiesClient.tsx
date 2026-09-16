"use client";

import { McTab } from "@/components/McButton";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import { useMemo, useState } from "react";

type Tab = "reading" | "music" | "movies" | "travel" | "sideQuests";

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
}: {
  activities: Portfolio["activities"];
}) {
  const [tab, setTab] = useState<Tab>("reading");

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
    <McMenuScreen title="Music & Sounds">
      <div className="mc-menu-content">
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
              <div className="mc-row__main">
                <div className="mc-row__title">
                  {book.status === "reading" ? "📖 " : book.status === "finished" ? "✓ " : "📚 "}
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
              <div className="mc-row__main">
                <div className="mc-row__title">
                  {m.kind === "performance" ? "🎹 " : "🎵 "}
                  {m.album}
                </div>
                <div className="mc-row__sub">
                  {m.artist}
                  {m.status && m.kind === "performance" ? ` · ${PIECE_STATUS[m.status]}` : ""}
                </div>
              </div>
              {m.url ? (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-widget__link"
                >
                  YouTube
                </a>
              ) : m.status === "coming-soon" ? (
                <span className="mc-row__meta">soon</span>
              ) : null}
            </div>
          ))}

        {tab === "movies" &&
          activities.movies.map((m) => (
            <div key={m.title} className="mc-row" style={{ cursor: "default" }}>
              <div className="mc-row__main">
                <div className="mc-row__title">🎬 {m.title}</div>
                <div className="mc-row__sub">
                  d. {m.director}, {m.year}
                  {m.note && ` — ${m.note}`}
                </div>
              </div>
            </div>
          ))}

        {tab === "travel" &&
          activities.travel.map((t) => (
            <div key={t.place} className="mc-row" style={{ cursor: "default" }}>
              <div className="mc-row__main">
                <div className="mc-row__title">🗺 {t.place}</div>
                <div className="mc-row__sub">{t.note}</div>
              </div>
              <div className="mc-row__meta">{t.date}</div>
            </div>
          ))}

        {tab === "sideQuests" &&
          sideQuests.map((quest) => (
            <div key={quest.id} className="mc-row side-quest-row" style={{ cursor: "default" }}>
              <div className="mc-row__main">
                <div className="mc-row__title">⚔ {quest.title}</div>
                <div className="mc-row__sub">
                  {quest.achievement}
                  {quest.period ? ` · ${quest.period}` : ""}
                </div>
                <p className="side-quest-row__desc">{quest.description}</p>
                {quest.skills && quest.skills.length > 0 && (
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
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-widget__link side-quest-row__link"
                    >
                      {link.label} →
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
      </div>
    </McMenuScreen>
  );
}
