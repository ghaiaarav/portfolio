"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import { McSmallButton } from "@/components/McButton";
import type { Portfolio } from "@/lib/portfolio";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

type Project = Portfolio["projects"][number];
const ALIASES_KEY = "mc-project-aliases";
const HIDDEN_KEY = "mc-hidden-projects";

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [lastDeleted, setLastDeleted] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  const all = projects.filter((project) => !hiddenIds.includes(project.id));
  const selectedTarget =
    selected?.demoUrl && selected.demoUrl !== "#" ? selected.demoUrl : selected?.githubUrl;

  useEffect(() => {
    try {
      setAliases(JSON.parse(localStorage.getItem(ALIASES_KEY) ?? "{}"));
      setHiddenIds(JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]"));
    } catch {
      localStorage.removeItem(ALIASES_KEY);
      localStorage.removeItem(HIDDEN_KEY);
    }
  }, []);

  const saveAliases = (next: Record<string, string>) => {
    setAliases(next);
    localStorage.setItem(ALIASES_KEY, JSON.stringify(next));
  };

  const saveHidden = (next: string[]) => {
    setHiddenIds(next);
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
  };

  const openRename = () => {
    if (!selected) return;
    setRenameDraft(aliases[selected.id] ?? selected.title);
    setRenaming(true);
  };

  const commitRename = () => {
    if (!selected) return;
    const trimmed = renameDraft.trim();
    const next = { ...aliases };
    if (trimmed && trimmed !== selected.title) next[selected.id] = trimmed;
    else delete next[selected.id];
    saveAliases(next);
    setRenaming(false);
  };

  const deleteSelected = () => {
    if (!selected) return;
    saveHidden([...hiddenIds, selected.id]);
    setLastDeleted(selected.id);
    setSelected(null);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    saveHidden(hiddenIds.filter((id) => id !== lastDeleted));
    setLastDeleted(null);
  };

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
            <button
              type="button"
              className={`mc-button mc-button--quarter${selected ? "" : " mc-button--disabled"}`}
              disabled={!selected}
              onClick={openRename}
            >
              Rename
            </button>
            <button
              type="button"
              className={`mc-button mc-button--quarter${selected ? "" : " mc-button--disabled"}`}
              disabled={!selected}
              onClick={deleteSelected}
            >
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
      {renaming && selected && (
        <div className="mc-inline-dialog" role="dialog" aria-label="Rename world">
          <label htmlFor="world-name">Rename World</label>
          <input
            id="world-name"
            value={renameDraft}
            maxLength={40}
            autoFocus
            onChange={(event) => setRenameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") setRenaming(false);
            }}
          />
          <div className="mc-inline-dialog__actions">
            <button type="button" className="mc-small-btn" onClick={commitRename}>Save</button>
            <button type="button" className="mc-small-btn" onClick={() => setRenaming(false)}>Cancel</button>
          </div>
        </div>
      )}
      {lastDeleted && (
        <div className="mc-undo-bar">
          World removed from this device.
          <button type="button" className="mc-small-btn" onClick={undoDelete}>Undo</button>
        </div>
      )}
      {all.map((project) => {
        const isSelected = selected?.id === project.id;
        return (
          <Fragment key={project.id}>
            <ProjectRow
              project={project}
              displayTitle={aliases[project.id] ?? project.title}
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
  displayTitle,
  selected,
  onSelect,
}: {
  project: Project;
  displayTitle: string;
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
      <div className="mc-select-row__icon mc-select-row__icon--world">
        <Image src={project.imageUrl} alt="" fill sizes="54px" />
      </div>
      <div className="mc-select-row__main">
        <div className="mc-select-row__title">{displayTitle}</div>
        <div className="mc-select-row__sub">
          {project.type} · {project.scope} · {project.lastUpdated}
        </div>
      </div>
    </div>
  );
}
