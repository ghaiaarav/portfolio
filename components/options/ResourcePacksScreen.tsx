"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";

function PackEntry({
  resource,
}: {
  resource: Portfolio["resources"][number];
}) {
  return (
    <a
      className="mc-resource-entry"
      href={resource.url}
      target={resource.download ? undefined : "_blank"}
      rel={resource.download ? undefined : "noopener noreferrer"}
      download={resource.download || undefined}
    >
      <div className="mc-resource-entry__icon">
        <Image src={resource.imageUrl} alt="" fill sizes="64px" />
      </div>
      <div className="mc-resource-entry__text">
        <div className="mc-resource-entry__name">{resource.name}</div>
        <div className="mc-resource-entry__desc">{resource.description}</div>
      </div>
      <span className="mc-resource-entry__kind">{resource.kind}</span>
    </a>
  );
}

export default function ResourcePacksScreen({
  resources,
}: {
  resources: Portfolio["resources"];
}) {
  const research = resources.filter((resource) => resource.kind !== "Project");
  const projects = resources.filter((resource) => resource.kind === "Project");

  return (
    <McMenuScreen title="Research Library" doneHref="/options" wide>
      <div className="mc-resource-columns">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Documents & Research</div>
          <div className="mc-resource-column__list">
            {research.map((resource) => (
              <PackEntry key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Project Artifacts</div>
          <div className="mc-resource-column__list">
            {projects.map((resource) => (
              <PackEntry key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
