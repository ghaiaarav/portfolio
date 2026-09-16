"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import type { Portfolio } from "@/lib/portfolio";
import { useState } from "react";

type Experience = Portfolio["experience"][number];

export default function ExperienceClient({
  experience,
  openToWork,
}: {
  experience: Experience[];
  openToWork: Portfolio["openToWork"];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <McSelectScreen
      title="Play Multiplayer"
      footer={
        <div className="mc-select-screen__actions">
          <div className="menu-buttons__row">
            <span className="mc-button-wrap">
              <button
                type="button"
                className={`mc-button mc-button--half ${selected ? "" : "mc-button--disabled"}`}
                disabled={!selected}
              >
                Join Server
              </button>
            </span>
            <McOptionButton href="/options/contact" label="Direct Connect" ellipsis={false} />
            <McOptionButton href="/options/contact" label="Add Server" ellipsis={false} />
          </div>
          <div className="menu-buttons__row menu-buttons__row--quad">
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Edit
            </button>
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Delete
            </button>
            <button type="button" className="mc-button mc-button--quarter" onClick={() => setExpanded(null)}>
              Refresh
            </button>
            <McDoneButton label="Cancel" size="quarter" />
          </div>
        </div>
      }
    >
      {openToWork.enabled && (
        <div className="mc-select-row mc-select-row--online">
          <div className="mc-select-row__icon" aria-hidden="true">
            +
          </div>
          <div className="mc-select-row__main">
            <div className="mc-select-row__title">Add Server</div>
            <div className="mc-select-row__sub">{openToWork.message}</div>
          </div>
          <div className="mc-select-row__ping">Online</div>
        </div>
      )}

      {experience.map((exp) => (
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
            <div className="mc-select-row__icon" aria-hidden="true">
              ⛏
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

      <p className="mc-select-scan">Scanning for games on your local network</p>
    </McSelectScreen>
  );
}
