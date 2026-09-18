"use client";

import { DISCOVERY_IDS, useEasterEggs } from "@/components/easter-eggs/EasterEggProvider";
import McMenuScreen from "@/components/mc/McMenuScreen";

const LABELS = {
  skin: "The Player",
  konami: "Old Commands",
  settings: "Quake After Dark",
  server: "The Fifth Server",
  gallery: "A Strange Photograph",
} as const;

export default function SecretRoomScreen() {
  const { found, complete } = useEasterEggs();

  return (
    <McMenuScreen title={complete ? "Secret Room" : "Locked Room"} doneHref="/" wide>
      <div className="mc-secret-room">
        <div className="mc-secret-chests">
          {DISCOVERY_IDS.map((id) => (
            <div className={`mc-secret-chest${found.includes(id) ? " mc-secret-chest--open" : ""}`} key={id}>
              <span aria-hidden="true">{found.includes(id) ? "▣" : "□"}</span>
              <strong>{found.includes(id) ? LABELS[id] : "Undiscovered"}</strong>
            </div>
          ))}
        </div>
        {complete ? (
          <div className="mc-secret-credits">
            <h2>Build History Wall</h2>
            <p>Built by Aarav Ghai, one menu at a time.</p>
            <p>Inspired by classic Minecraft interfaces, applied mathematics, research, and side quests.</p>
            <p>Thanks for looking closely enough to find everything.</p>
          </div>
        ) : (
          <p className="mc-secret-locked">Find all five discoveries to open the chests. Current count: {found.length}/5</p>
        )}
      </div>
    </McMenuScreen>
  );
}
