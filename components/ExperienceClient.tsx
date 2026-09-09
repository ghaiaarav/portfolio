"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
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

  return (
    <McMenuScreen title="Play Multiplayer" doneHref="/">
      <div className="mc-menu-content">
        {openToWork.enabled && (
          <div className="mc-row" style={{ borderColor: "#5a5", marginBottom: "12px" }}>
            <div className="mc-row__main">
              <div className="mc-row__title">Add Server</div>
              <div className="mc-row__sub">{openToWork.message}</div>
            </div>
            <div className="mc-row__meta">Online</div>
          </div>
        )}

        {experience.map((exp) => (
          <div key={exp.id}>
            <div
              className="mc-row"
              onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && setExpanded(expanded === exp.id ? null : exp.id)
              }
              role="button"
              tabIndex={0}
            >
              <div className="mc-row__main">
                <div className="mc-row__title">{exp.company}</div>
                <div className="mc-row__sub">{exp.role}</div>
              </div>
              <div className="mc-row__meta">
                {exp.location}
                <br />
                {exp.team}
              </div>
            </div>
            {expanded === exp.id && (
              <div className="detail-panel">
                <p style={{ margin: "0 0 8px", color: "#aaa" }}>{exp.dates}</p>
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
      </div>
    </McMenuScreen>
  );
}
