import fallback from "@/content/logs-fallback.json";
import loreOverrides from "@/content/logs-lore.json";
import { loreForCommit, type LogIcon } from "@/lib/logLore";
import { execFileSync } from "node:child_process";

export type GitLogEntry = {
  hash: string;
  date: string;
  message: string;
  lore: string;
  icon: LogIcon;
};

const HANDWRITTEN_LORE = loreOverrides as Record<string, string>;

function withLore(entry: { hash: string; date: string; message: string }): GitLogEntry {
  const generated = loreForCommit(entry.message);
  const custom = HANDWRITTEN_LORE[entry.hash];
  return {
    ...entry,
    ...generated,
    ...(custom ? { lore: custom } : {}),
  };
}

export function getGitLogs(): GitLogEntry[] {
  try {
    const output = execFileSync(
      "git",
      ["log", "-16", "--pretty=format:%h%x1f%ad%x1f%s", "--date=short"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const entries = output
      .split(/\r?\n/)
      .map((line) => line.split("\x1f"))
      .filter((parts) => parts.length === 3)
      .map(([hash, date, message]) => withLore({ hash, date, message }))
      .filter((entry) => !entry.message.toLowerCase().startsWith("merge "));
    return entries.length ? entries : fallback.map(withLore);
  } catch {
    return fallback.map(withLore);
  }
}
