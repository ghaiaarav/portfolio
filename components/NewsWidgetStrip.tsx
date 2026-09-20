import { ConfirmLink } from "@/components/ExternalConfirmProvider";
import Link from "next/link";
import { getFavouriteSong, getPortfolio, getRecentMovie } from "@/lib/portfolio";

export default function NewsWidgetStrip() {
  const data = getPortfolio();
  const { homeWidgets } = data;
  const favouriteSong = getFavouriteSong();
  const reading = homeWidgets.currentlyReading[0];
  const movie = getRecentMovie();
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
          <ConfirmLink href={music.url} className="news-widget__link">
            {music.album}
          </ConfirmLink>{" "}
          by {music.artist}
        </p>
      )}
      {favouriteSong && (
        <p className="news-widget__line">
          <span className="news-widget__label">Favourite song: </span>
          <em>{favouriteSong.title}</em> — {favouriteSong.artist}
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
