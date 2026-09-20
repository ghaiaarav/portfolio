"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import { useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import type { Portfolio } from "@/lib/portfolio";
import { createRefreshSchedule } from "@/lib/multiplayerRefresh";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Experience = Portfolio["experience"][number];

export default function ExperienceClient({
  experience,
  openToWork,
}: {
  experience: Experience[];
  openToWork: Portfolio["openToWork"];
}) {
  const router = useRouter();
  const { discover } = useEasterEggs();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(experience.length);
  const [hiddenServer, setHiddenServer] = useState(false);
  const [scanStatus, setScanStatus] = useState("Scanning for games on your local network");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const refresh = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setExpanded(null);
    setSelected(null);
    setVisibleCount(0);
    setHiddenServer(false);
    setScanStatus("Pinging servers...");

    const schedule = createRefreshSchedule(experience.length);
    schedule.reveals.forEach((delay, index) => {
      timers.current.push(window.setTimeout(() => setVisibleCount(index + 1), delay));
    });
    const lastReveal = schedule.reveals.at(-1) ?? 0;
    timers.current.push(window.setTimeout(() => {
      setScanStatus("Scanning for games on your local network...");
    }, lastReveal + 250));
    timers.current.push(window.setTimeout(() => {
      setHiddenServer(true);
      setScanStatus("Found 1 additional server");
    }, schedule.hiddenAt));
  };

  return (
    <McSelectScreen
      title="Play Multiplayer"
      footer={
        <div className="mc-select-screen__actions">
          <div className="menu-buttons__row">
            <span className="mc-button-wrap">
              <button type="button" className="mc-button mc-button--half mc-button--disabled" disabled>
                Feature TBA
              </button>
            </span>
            <span className="mc-button-wrap">
              <button type="button" className="mc-button mc-button--half mc-button--disabled" disabled>
                Direct Connect
              </button>
            </span>
            <McOptionButton href="/options?attention=contact&origin=experience" label="Add Server" ellipsis={false} />
          </div>
          <div className="menu-buttons__row menu-buttons__row--quad">
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Edit
            </button>
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Delete
            </button>
            <button type="button" className="mc-button mc-button--quarter" onClick={refresh}>
              Refresh
            </button>
            <McDoneButton label="Cancel" size="quarter" />
          </div>
        </div>
      }
    >
      {openToWork.enabled && (
        <div
          className="mc-select-row mc-select-row--online"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/options?attention=contact&origin=experience")}
          onKeyDown={(event) => event.key === "Enter" && router.push("/options?attention=contact&origin=experience")}
        >
          <div className="mc-select-row__icon mc-select-row__icon--add" aria-hidden="true">
            +
          </div>
          <div className="mc-select-row__main">
            <div className="mc-select-row__title">Add Server</div>
            <div className="mc-select-row__sub">{openToWork.message}</div>
          </div>
          <div className="mc-select-row__ping">Online</div>
        </div>
      )}

      {experience.slice(0, visibleCount).map((exp) => (
        <div key={exp.id}>
          <div
            className={`mc-select-row${selected === exp.id ? " mc-select-row--active" : ""}`}
            onClick={() => {
              setSelected(exp.id);
              setExpanded(expanded === exp.id ? null : exp.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSelected(exp.id);
                setExpanded(expanded === exp.id ? null : exp.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="mc-select-row__icon mc-select-row__icon--server">
              <Image src={exp.imageUrl} alt="" fill sizes="54px" style={{ objectFit: "contain" }} />
            </div>
            <div className="mc-select-row__main">
              <div className="mc-select-row__title">{exp.company}</div>
              <div className="mc-select-row__sub">
                {exp.role} · {exp.dates}
              </div>
            </div>
            <div className="mc-select-row__ping">{exp.location}</div>
          </div>
          {expanded === exp.id && (
            <div className="mc-select-detail">
              <p>{exp.description}</p>
              <ul style={{ paddingLeft: "1.2rem", margin: "8px 0" }}>
                {exp.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div>
                {exp.tech.map((t) => (
                  <span key={t} className="mc-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {hiddenServer && (
        <div
          className={`mc-select-row mc-select-row--mystery${selected === "__hidden" ? " mc-select-row--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelected("__hidden");
            discover("server");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setSelected("__hidden");
              discover("server");
            }
          }}
        >
          <div className="mc-select-row__icon mc-select-row__icon--mystery" aria-hidden="true">?</div>
          <div className="mc-select-row__main">
            <div className="mc-select-row__title">click me!</div>
            <div className="mc-select-row__sub">A server answered after the scan ended.</div>
          </div>
          <div className="mc-select-row__ping">???</div>
        </div>
      )}

      <div className="mc-select-scan-wrap">
        <p className="mc-select-scan">{scanStatus}</p>
        {/scanning|pinging/i.test(scanStatus) && (
          <div className="mc-select-scan__bubbles" aria-hidden="true">
            <span className="mc-select-scan__bubble mc-select-scan__bubble--0" />
            <span className="mc-select-scan__bubble mc-select-scan__bubble--1" />
            <span className="mc-select-scan__bubble mc-select-scan__bubble--2" />
          </div>
        )}
      </div>
    </McSelectScreen>
  );
}
