import McMenuScreen from "@/components/mc/McMenuScreen";
import type { RepositoryLog } from "@/lib/repositoryLogs";

export default function LogsScreen({ logs }: { logs: RepositoryLog[] }) {
  return (
    <McMenuScreen title="Logs" doneHref="/options" wide>
      <div className="mc-logs-panel">
        {logs.map((entry) => (
          <a
            key={entry.sha}
            className="mc-log-entry"
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mc-log-entry__date">{entry.date}</span>
            <span className="mc-log-entry__message">{entry.message}</span>
            <span className="mc-log-entry__sha">{entry.sha}</span>
          </a>
        ))}
      </div>
    </McMenuScreen>
  );
}
