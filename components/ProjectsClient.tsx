"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { McSmallButton } from "@/components/McButton";
import type { Portfolio } from "@/lib/portfolio";
import { useState } from "react";

type Project = Portfolio["projects"][number];

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <McMenuScreen title="Select World" doneHref="/">
      <div className="mc-menu-content">
        {featured && (
          <>
            <p className="section-heading">Create New World (Featured)</p>
            <ProjectRow project={featured} selected={selected} onSelect={setSelected} />
          </>
        )}

        <p className="section-heading">Saved Worlds</p>
        {rest.map((p) => (
          <ProjectRow key={p.id} project={p} selected={selected} onSelect={setSelected} />
        ))}

        {selected && (
          <div className="detail-panel">
            <h3 style={{ margin: "0 0 8px", color: "#fff" }}>{selected.title}</h3>
            <p>{selected.description}</p>
            <div>
              {selected.tags.map((tag) => (
                <span key={tag} className="mc-tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="detail-panel__actions">
              {selected.demoUrl && selected.demoUrl !== "#" && (
                <McSmallButton href={selected.demoUrl} external>
                  Play Selected World
                </McSmallButton>
              )}
              {selected.githubUrl && (
                <McSmallButton href={selected.githubUrl} external>
                  Open Folder
                </McSmallButton>
              )}
            </div>
          </div>
        )}
      </div>
    </McMenuScreen>
  );
}

function ProjectRow({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: Project | null;
  onSelect: (p: Project) => void;
}) {
  const isActive = selected?.id === project.id;
  return (
    <div
      className="mc-row"
      style={isActive ? { borderColor: "#aaa" } : undefined}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(project)}
      role="button"
      tabIndex={0}
    >
      <div className="mc-row__main">
        <div className="mc-row__title">{project.title}</div>
        <div className="mc-row__sub">
          {project.type} · {project.scope}
        </div>
      </div>
      <div className="mc-row__meta">{project.lastUpdated}</div>
    </div>
  );
}
