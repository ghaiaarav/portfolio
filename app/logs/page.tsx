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
            <span className="mc-log-entry__torch" aria-hidden="true" />
            <div>
              <strong>{log.message}</strong>
              <span>{log.date} · {log.hash}</span>
            </div>
          </article>
        ))}
      </div>
    </McMenuScreen>
  );
}
