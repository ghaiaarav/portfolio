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
export type GalleryItem = {
  id: string;
  label: string;
  kind: "photo" | "video";
  src: string;
  alt: string;
  experienceId?: string;
  easterEgg?: boolean;
};
export type PortfolioResource = {
  id: string;
  name: string;
  kind: string;
  description: string;
  url: string;
  imageUrl: string;
  download?: boolean;
};
type Experience = Omit<(typeof portfolioData.experience)[number], "media"> & {
  media: GalleryItem[];
};

export type Portfolio = Omit<
  typeof portfolioData,
  "activities" | "homeWidgets" | "links" | "experience" | "gallery" | "resources"
> & {
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
  experience: Experience[];
  gallery: GalleryItem[];
  resources: PortfolioResource[];
  links: ExternalLink[];
};

export function getPortfolio(): Portfolio {
  return portfolioData as Portfolio;
}

export function getSongOfDay() {
  const today = new Date().toISOString().slice(0, 10);
  const songs = portfolioData.homeWidgets.songOfDay;
  const match = songs.find((s) => s.date === today);
  return match ?? songs[0];
}
