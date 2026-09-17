export type RepositoryLog = {
  sha: string;
  date: string;
  message: string;
  url: string;
};

const FALLBACK_LOGS: RepositoryLog[] = [
  {
    sha: "f2d522b",
    date: "2026-09-16",
    message: "Build Minecraft portfolio interface",
    url: "https://github.com/ghaiaarav/portfolio/commit/f2d522b",
  },
  {
    sha: "802f076",
    date: "2026-09-16",
    message: "Add authentic Minecraft menu stack",
    url: "https://github.com/ghaiaarav/portfolio/commit/802f076",
  },
];

export async function getRepositoryLogs(): Promise<RepositoryLog[]> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/ghaiaarav/portfolio/commits?per_page=20",
      {
        cache: "force-cache",
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    if (!response.ok) return FALLBACK_LOGS;
    const commits = (await response.json()) as Array<{
      sha: string;
      html_url: string;
      commit: { message: string; author: { date: string } | null };
    }>;
    return commits
      .map((entry) => ({
        sha: entry.sha.slice(0, 7),
        date: entry.commit.author?.date.slice(0, 10) ?? "",
        message: entry.commit.message.split("\n")[0],
        url: entry.html_url,
      }))
      .filter((entry) => !entry.message.startsWith("Merge pull request"))
      .slice(0, 12);
  } catch {
    return FALLBACK_LOGS;
  }
}
