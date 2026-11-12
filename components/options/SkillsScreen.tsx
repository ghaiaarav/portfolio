"use client";

import { ConfirmLink } from "@/components/ExternalConfirmProvider";
import { McTab } from "@/components/McButton";
import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import { useState } from "react";

type Tab = "skills" | "coursework" | "honors" | "resources";

const TABS: { id: Tab; label: string }[] = [
  { id: "skills", label: "Skills" },
  { id: "coursework", label: "Coursework" },
  { id: "honors", label: "Honors" },
  { id: "resources", label: "Resources" },
];

const HONOR_ICONS: Record<string, string> = {
  Mathematics: "/textures/icons/books.png",
  Physics: "/textures/items/compass.png",
  "Computer Science": "/textures/icons/redstone.png",
  Leadership: "/textures/items/map.png",
  Mentorship: "/textures/items/torch.png",
  Academic: "/textures/items/book.png",
};

export default function SkillsScreen({
  skills,
  education,
  honors,
  resources,
}: {
  skills: Portfolio["skills"];
  education: Portfolio["education"];
  honors: Portfolio["honors"];
  resources: Portfolio["resources"];
}) {
  const [tab, setTab] = useState<Tab>("skills");
  const sortedHonors = [...honors].sort((a, b) => b.year - a.year);

  return (
    <McMenuScreen title="Skills" doneHref="/options" wide>
      <div className="mc-resource-column mc-pack-list mc-skills-panel">
        <div className="mc-tabs mc-skills-panel__tabs">
          {TABS.map((t) => (
            <McTab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </McTab>
          ))}
        </div>
        <div className="mc-resource-column__list">
          {tab === "skills" &&
            skills.map((group) => (
              <div key={group.category} className="mc-resource-entry mc-resource-entry--static">
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{group.category}</div>
                  <div className="mc-skills-panel__tags">
                    {group.items.map((item) => (
                      <span key={item} className="mc-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {tab === "coursework" &&
            education.map((school) => (
              <div key={school.school} className="mc-resource-entry mc-resource-entry--static">
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{school.school}</div>
                  <div className="mc-resource-entry__desc">
                    {school.degree} · {school.dates} · GPA {school.gpa}
                  </div>
                  <div className="mc-skills-panel__tags">
                    {school.coursework.map((course) => (
                      <span key={course} className="mc-tag">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

          {tab === "honors" &&
            sortedHonors.map((honor) => (
              <div key={`${honor.title}-${honor.year}`} className="mc-resource-entry mc-resource-entry--static">
                <div className="mc-resource-entry__icon mc-resource-entry__icon--item">
                  <img src={HONOR_ICONS[honor.category] ?? "/textures/items/chest.png"} alt="" width={32} height={32} />
                </div>
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{honor.title}</div>
                  <div className="mc-resource-entry__desc">
                    {honor.category} · {honor.year} · {honor.detail}
                  </div>
                </div>
              </div>
            ))}

          {tab === "resources" &&
            resources.map((resource) => (
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
