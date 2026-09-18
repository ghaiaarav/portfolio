import fallback from "@/content/logs-fallback.json";
import { execFileSync } from "node:child_process";

export type GitLogEntry = {
  hash: string;
  date: string;
  message: string;
};

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
      .map(([hash, date, message]) => ({ hash, date, message }))
      .filter((entry) => !entry.message.toLowerCase().startsWith("merge "));
    return entries.length ? entries : fallback;
  } catch {
    return fallback;
  }
}
