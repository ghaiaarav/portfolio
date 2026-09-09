import Link from "next/link";
import { getPortfolio, getSongOfDay } from "@/lib/portfolio";

export default function NewsWidgetStrip() {
  const data = getPortfolio();
  const { homeWidgets } = data;
  const song = getSongOfDay();
  const reading = homeWidgets.currentlyReading[0];
  const movie = homeWidgets.recentMovies[0];
  const music = homeWidgets.musicRecs[0];

  return (
    <div className="news-widget">
      <p className="news-widget__line">
        <span className="news-widget__label">Recent news: </span>
        {homeWidgets.recentNews.url ? (
          <Link href={homeWidgets.recentNews.url} className="news-widget__link">
            {homeWidgets.recentNews.text}
          </Link>
        ) : (
          homeWidgets.recentNews.text
        )}
      </p>
      {reading && (
        <p className="news-widget__line">
          <span className="news-widget__label">Currently reading: </span>
          <em>{reading.title}</em> by {reading.author}
        </p>
      )}
      {movie && (
        <p className="news-widget__line">
          <span className="news-widget__label">Recent movie: </span>
          {movie.title} (d. {movie.director}, {movie.year})
        </p>
      )}
      {music && (
        <p className="news-widget__line">
          <span className="news-widget__label">Music rec: </span>
          <a href={music.url} target="_blank" rel="noopener noreferrer" className="news-widget__link">
            {music.album}
          </a>{" "}
          by {music.artist}
        </p>
      )}
      {song && (
        <p className="news-widget__line">
          <span className="news-widget__label">Song of the day: </span>
          {song.title} — {song.artist}
        </p>
      )}
      <div className="news-widget__see-all">
        <Link href="/activities" className="news-widget__link">
          See all activities →
        </Link>
      </div>
    </div>
  );
}
