import McMenuScreen from "@/components/mc/McMenuScreen";
import { getGitLogs } from "@/lib/gitLogs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Logs" };

export default function LogsPage() {
  const logs = getGitLogs();

  return (
    <McMenuScreen title="Logs" doneHref="/options" wide>
      <div className="mc-log-list">
        {logs.map((log) => (
          <article className="mc-log-entry" key={log.hash}>
            <img
              className={`mc-log-entry__icon mc-log-entry__icon--${log.icon}`}
              src={`/textures/items/${log.icon}.png`}
              alt=""
              width={32}
              height={32}
            />
            <div>
              <strong>{log.lore}</strong>
              <span>
                {log.date} · {log.hash} · {log.message}
              </span>
            </div>
          </article>
        ))}
      </div>
    </McMenuScreen>
  );
}
