import portfolioData from "@/content/portfolio.json";

type Movie = { title: string; director: string; year: number; note?: string };
type Reading = {
  title: string;
  author: string;
  status: "reading" | "finished" | "coursework" | "queue";
  category?: string;
};
type Music = {
  album: string;
  artist: string;
  url: string;
  kind?: "performance" | "listening";
  status?: "learning" | "planned" | "recorded" | "coming-soon";
};
type Travel = { place: string; date: string; note: string };
type SideQuest = {
  id: string;
  title: string;
  achievement: string;
  period?: string;
  description: string;
  skills?: string[];
  links?: { label: string; url: string }[];
};
type ExternalLink = { label: string; url: string };

export type Portfolio = Omit<typeof portfolioData, "activities" | "homeWidgets" | "links"> & {
  activities: {
    reading: Reading[];
    music: Music[];
    movies: Movie[];
    travel: Travel[];
    sideQuests: SideQuest[];
  };
  homeWidgets: Omit<typeof portfolioData.homeWidgets, "recentMovies"> & {
    recentMovies: Movie[];
  };
  links: ExternalLink[];
};

export function getPortfolio(): Portfolio {
  return portfolioData as Portfolio;
}

export function getFavouriteSong() {
  const song = portfolioData.homeWidgets.favouriteSong;
  if (!song?.title) return null;
  return song;
}

export function getRecentMovie() {
  const movies = portfolioData.homeWidgets.recentMovies;
  if (!movies.length) return null;
  return movies[movies.length - 1];
}
