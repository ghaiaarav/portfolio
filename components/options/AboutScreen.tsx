"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";
import Link from "next/link";

export default function AboutScreen({ data }: { data: Portfolio }) {
  return (
    <McMenuScreen title="Skin Customization" doneHref="/options">
      <div className="mc-list-panel">
        <div className="mc-list-panel__item mc-list-panel__item--hero">
          <div className="about-avatar about-avatar--menu" aria-hidden={!data.about.avatarUrl}>
            {data.about.avatarUrl ? (
              <Image
                src={data.about.avatarUrl}
                alt={data.about.avatarAlt ?? data.name}
                width={64}
                height={64}
                className="about-avatar__img"
                unoptimized
              />
            ) : (
              "👤"
            )}
          </div>
          <div>
            <div className="mc-list-panel__title">{data.name}</div>
            {data.about.oneLiner && (
              <div className="mc-list-panel__sub">{data.about.oneLiner}</div>
            )}
            <div className="mc-list-panel__sub">
              {data.about.status} · {data.about.location}
            </div>
          </div>
        </div>
        <div className="mc-list-panel__scroll">
          <p className="mc-list-panel__bio">{data.about.bio}</p>
          <div className="news-widget news-widget--in-panel">
            <p className="news-widget__line">
              <span className="news-widget__label">Recent news: </span>
              {data.homeWidgets.recentNews.url ? (
                <Link href={data.homeWidgets.recentNews.url} className="news-widget__link">
                  {data.homeWidgets.recentNews.text}
                </Link>
              ) : (
                data.homeWidgets.recentNews.text
              )}
            </p>
            {data.homeWidgets.currentlyReading[0] && (
              <p className="news-widget__line">
                <span className="news-widget__label">Currently reading: </span>
                <em>{data.homeWidgets.currentlyReading[0].title}</em> by{" "}
                {data.homeWidgets.currentlyReading[0].author}
              </p>
            )}
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
