"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";

function PackEntry({
  name,
  description,
  icon = "📦",
  image,
  href,
}: {
  name: string;
  description: string;
  icon?: string;
  image?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="mc-resource-entry__icon">
        {image ? (
          <Image src={image} alt="" fill sizes="64px" />
        ) : (
          <span aria-hidden="true">{icon}</span>
        )}
      </div>
      <div className="mc-resource-entry__text">
        <div className="mc-resource-entry__name">{name}</div>
        <div className="mc-resource-entry__desc">{description}</div>
      </div>
    </>
  );
  return href ? (
    <a className="mc-resource-entry" href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : <div className="mc-resource-entry">{content}</div>;
}

export default function ResourcePacksScreen({
  resources,
}: {
  resources: Portfolio["resources"];
}) {
  const kinds = [...new Set(resources.map((resource) => resource.kind))];
  return (
    <McMenuScreen title="Research Library" doneHref="/options" wide>
      <div className="mc-resource-columns">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Shelves</div>
          <div className="mc-resource-column__list">
            {kinds.map((kind) => (
              <PackEntry
                key={kind}
                icon="▤"
                name={kind}
                description={`${resources.filter((resource) => resource.kind === kind).length} resource(s)`}
              />
            ))}
          </div>
        </div>
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Available Downloads & Links</div>
          <div className="mc-resource-column__list">
            {resources.map((resource) => (
              <PackEntry
                key={resource.id}
                image={resource.imageUrl}
                name={resource.title}
                description={`${resource.kind} · ${resource.description}`}
                href={resource.url}
              />
            ))}
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
