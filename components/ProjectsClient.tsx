"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import { McSmallButton } from "@/components/McButton";
import type { Portfolio } from "@/lib/portfolio";
import { Fragment, useState } from "react";

type Project = Portfolio["projects"][number];

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const all = projects;
  const selectedTarget =
    selected?.demoUrl && selected.demoUrl !== "#" ? selected.demoUrl : selected?.githubUrl;

  return (
    <McSelectScreen
      title="Select World"
      footer={
        <div className="mc-select-screen__actions">
          <div className="menu-buttons__row">
            {selectedTarget ? (
              <McOptionButton
                href={selectedTarget}
                label="Play Selected World"
                ellipsis={false}
                external
              />
            ) : (
              <span className="mc-button-wrap">
                <button type="button" className="mc-button mc-button--half mc-button--disabled" disabled>
                  Play Selected World
                </button>
              </span>
            )}
            <McOptionButton
              href="https://github.com/ghaiaarav?tab=repositories"
              label="Create New World"
              ellipsis={false}
              external
            />
          </div>
          <div className="menu-buttons__row menu-buttons__row--quad">
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Rename
            </button>
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Delete
            </button>
            <button type="button" className="mc-button mc-button--quarter mc-button--disabled" disabled>
              Backup
            </button>
            <McDoneButton label="Cancel" size="quarter" />
          </div>
        </div>
      }
    >
      {all.map((project) => {
        const isSelected = selected?.id === project.id;
        return (
          <Fragment key={project.id}>
            <ProjectRow
              project={project}
              selected={selected}
              onSelect={setSelected}
            />
            {isSelected && (
              <div className="mc-select-detail">
                <p>{project.description}</p>
                <div>
                  {project.tags.map((tag) => (
                    <span key={tag} className="mc-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="detail-panel__actions">
                  {project.demoUrl && project.demoUrl !== "#" && (
                    <McSmallButton href={project.demoUrl} external>
                      Play Selected World
                    </McSmallButton>
                  )}
                  {project.githubUrl && (
                    <McSmallButton href={project.githubUrl} external>
                      Open Folder
                    </McSmallButton>
                  )}
                </div>
              </div>
            )}
          </Fragment>
        );
      })}
    </McSelectScreen>
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
      className={`mc-select-row${isActive ? " mc-select-row--active" : ""}`}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(project)}
      role="button"
      tabIndex={0}
    >
      <div className="mc-select-row__icon mc-select-row__icon--world" aria-hidden="true" />
      <div className="mc-select-row__main">
        <div className="mc-select-row__title">{project.title}</div>
        <div className="mc-select-row__sub">
          {project.type} · {project.scope} · {project.lastUpdated}
        </div>
      </div>
    </div>
  );
}
