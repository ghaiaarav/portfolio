"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import { useDiscoveries } from "@/components/easter-eggs/EasterEggProvider";
import type { Portfolio } from "@/lib/portfolio";
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(experience.length);
  const [scanning, setScanning] = useState(false);
  const [lostServerVisible, setLostServerVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const router = useRouter();
  const { discover } = useDiscoveries();
  const selectedExperience = experience.find((item) => item.id === selected);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const refreshServers = () => {
    clearTimers();
    setExpanded(null);
    setSelected(null);
    setVisibleCount(0);
    setLostServerVisible(false);
    setScanning(true);

    let elapsed = 0;
    experience.forEach((_, index) => {
      elapsed += 220 + Math.floor(Math.random() * 430);
      timers.current.push(setTimeout(() => setVisibleCount(index + 1), elapsed));
    });

    const hiddenDelay = elapsed + 2000 + Math.floor(Math.random() * 1000);
    timers.current.push(
      setTimeout(() => {
        setLostServerVisible(true);
        setScanning(false);
      }, hiddenDelay)
    );
  };

  const findLostServer = () => {
    setSelected("lost-server");
    setExpanded(null);
    discover("lost-server", "A server that was not on the list answered.");
  };

  return (
    <McSelectScreen
      title="Play Multiplayer"
      footer={
        <div className="mc-select-screen__actions">
          <div className="menu-buttons__row">
            {selectedExperience ? (
              <McOptionButton
                href={`/options/gallery?experience=${selectedExperience.id}&origin=experience`}
                label="Join Server"
                ellipsis={false}
              />
            ) : selected === "lost-server" ? (
              <McOptionButton label="Join Server" ellipsis={false} onClick={findLostServer} />
            ) : (
              <span className="mc-button-wrap">
                <button type="button" className="mc-button mc-button--half mc-button--disabled" disabled>
                  Join Server
                </button>
              </span>
            )}
            <McOptionButton href="/options/contact?origin=experience" label="Direct Connect" ellipsis={false} />
            <McOptionButton href="/options?prompt=contact&origin=experience" label="Add Server" ellipsis={false} />
          </div>
          <div className="menu-buttons__row menu-buttons__row--quad">
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Edit
            </button>
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Delete
            </button>
            <button type="button" className="mc-button mc-button--quarter" onClick={refreshServers}>
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
          onClick={() => router.push("/options?prompt=contact&origin=experience")}
          onKeyDown={(event) => event.key === "Enter" && router.push("/options?prompt=contact&origin=experience")}
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
              <Image src={exp.imageUrl} alt="" fill sizes="54px" />
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

      {lostServerVisible && (
        <div
          className={`mc-select-row mc-select-row--mystery${selected === "lost-server" ? " mc-select-row--active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={findLostServer}
          onKeyDown={(event) => event.key === "Enter" && findLostServer()}
        >
          <div className="mc-select-row__icon mc-select-row__icon--mystery" aria-hidden="true">?</div>
          <div className="mc-select-row__main">
            <div className="mc-select-row__title">§k LOST SIGNAL §r</div>
            <div className="mc-select-row__sub">It was not here when the scan began. Click me.</div>
          </div>
          <div className="mc-select-row__ping">???</div>
        </div>
      )}

      <p className="mc-select-scan">
        {scanning
          ? `Pinging servers${".".repeat((visibleCount % 3) + 1)}`
          : lostServerVisible
            ? "Scan complete. One response arrived late."
            : "Scanning for games on your local network"}
      </p>
    </McSelectScreen>
  );
}
