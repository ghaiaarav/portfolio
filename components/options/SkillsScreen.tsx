"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { ConfirmLink } from "@/components/ExternalConfirmProvider";
import type { Portfolio } from "@/lib/portfolio";

export default function SkillsScreen({
  resources,
}: {
  resources: Portfolio["resources"];
}) {
  return (
    <McMenuScreen title="Skills" doneHref="/options" wide>
      <div className="mc-resource-column mc-pack-list">
        <div className="mc-resource-column__title">Resource Library</div>
        <div className="mc-resource-column__list">
          {resources.map((resource) => (
            <ConfirmLink key={resource.id} href={resource.url} className="mc-resource-entry">
              <div className="mc-resource-entry__icon">
                <img src={resource.imageUrl} alt="" width={58} height={44} />
              </div>
              <div className="mc-resource-entry__text">
                <div className="mc-resource-entry__name">{resource.title}</div>
                <div className="mc-resource-entry__desc">
                  {resource.kind} · {resource.description}
                </div>
              </div>
            </ConfirmLink>
          ))}
        </div>
      </div>
    </McMenuScreen>
  );
}
