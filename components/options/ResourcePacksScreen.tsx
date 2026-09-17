"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";

const PACK_VISUALS: Record<string, string> = {
  Mathematics: "/resource-packs/mathematics.jpg",
  "Physics & Astrophysics": "/resource-packs/physics.jpg",
  "Computer Science": "/resource-packs/computer-science.jpg",
  "Data & Tools": "/resource-packs/data-tools.jpg",
};

function PackEntry({
  name,
  description,
  icon = "📦",
  image,
}: {
  name: string;
  description: string;
  icon?: string;
  image?: string;
}) {
  return (
    <div className="mc-resource-entry">
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
    </div>
  );
}

export default function ResourcePacksScreen({
  skills,
  education,
}: {
  skills: Portfolio["skills"];
  education: Portfolio["education"];
}) {
  return (
    <McMenuScreen title="Select Resource Packs" doneHref="/options" wide>
      <div className="mc-resource-columns">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Available Resource Packs</div>
          <div className="mc-resource-column__list">
            {education.map((edu) => (
              <PackEntry
                key={edu.school}
                image="/resource-packs/sjsu.jpg"
                name={edu.school}
                description={`${edu.degree} · ${edu.dates}${edu.gpa ? ` · GPA ${edu.gpa}` : ""}`}
              />
            ))}
          </div>
        </div>
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Selected Resource Packs</div>
          <div className="mc-resource-column__list">
            <PackEntry icon="✓" name="Default" description="The default look of Minecraft" />
            {skills.map((pack) => (
              <PackEntry
                key={pack.category}
                image={PACK_VISUALS[pack.category]}
                name={pack.category}
                description={pack.items.join(", ")}
              />
            ))}
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
