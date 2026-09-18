"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import McOptionButton from "@/components/mc/McOptionButton";
import McSelectScreen from "@/components/mc/McSelectScreen";
import { McSmallButton } from "@/components/McButton";
import { useMcSound } from "@/hooks/useMcSound";
import type { Portfolio } from "@/lib/portfolio";
import {
  hideProject,
  pushUndo,
  renameProject,
  type ProjectUndoAction,
  undoLast,
  undoStackFromHidden,
} from "@/lib/projectLocalState";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";

type Project = Portfolio["projects"][number];
const NAMES_KEY = "mc-project-names";
const HIDDEN_KEY = "mc-hidden-projects";
const UNDO_KEY = "mc-project-undo";

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const { playClick } = useMcSound();
  const [selected, setSelected] = useState<Project | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<ProjectUndoAction[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const all = useMemo(() => projects.filter((project) => !hidden.includes(project.id)), [projects, hidden]);
  const selectedTarget =
    selected?.demoUrl && selected.demoUrl !== "#" ? selected.demoUrl : selected?.githubUrl;
  const selectedName = selected ? names[selected.id] ?? selected.title : "";

  useEffect(() => {
    try {
      const storedNames = JSON.parse(localStorage.getItem(NAMES_KEY) ?? "{}") as Record<string, string>;
      const storedHidden = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]") as string[];
      const storedUndo = JSON.parse(localStorage.getItem(UNDO_KEY) ?? "[]") as ProjectUndoAction[];
      setNames(storedNames);
      setHidden(storedHidden);
      setUndoStack(
        Array.isArray(storedUndo) && storedUndo.length
          ? storedUndo
          : undoStackFromHidden(storedHidden)
      );
    } catch {
      localStorage.removeItem(NAMES_KEY);
      localStorage.removeItem(HIDDEN_KEY);
      localStorage.removeItem(UNDO_KEY);
    }
  }, []);

  const persist = (
    nextNames: Record<string, string>,
    nextHidden: string[],
    nextUndo: ProjectUndoAction[]
  ) => {
    setNames(nextNames);
    setHidden(nextHidden);
    setUndoStack(nextUndo);
    localStorage.setItem(NAMES_KEY, JSON.stringify(nextNames));
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(nextHidden));
    localStorage.setItem(UNDO_KEY, JSON.stringify(nextUndo));
  };

  const openRename = () => {
    if (!selected) return;
    playClick();
    setDraftName(selectedName);
    setRenaming(true);
  };

  const commitRename = () => {
    if (!selected) return;
    const nextNames = renameProject(names, selected.id, draftName);
    if (nextNames[selected.id] === selectedName) {
      setRenaming(false);
      return;
    }
    persist(
      nextNames,
      hidden,
      pushUndo(undoStack, {
        type: "rename",
        id: selected.id,
        previous: selectedName,
        next: nextNames[selected.id] ?? selectedName,
      })
    );
    setRenaming(false);
  };

  const deleteSelected = () => {
    if (!selected) return;
    playClick();
    const nextHidden = hideProject(hidden, selected.id);
    if (nextHidden === hidden) return;
    persist(names, nextHidden, pushUndo(undoStack, { type: "hide", id: selected.id }));
    setSelected(null);
    setRenaming(false);
  };

  const undo = () => {
    if (!undoStack.length) return;
    playClick();
    const result = undoLast(undoStack, names, hidden);
    persist(result.names, result.hidden, result.stack);
    if (result.restoredId) {
      setSelected(projects.find((project) => project.id === result.restoredId) ?? null);
    }
  };

  return (
    <McSelectScreen
      title={renaming ? "Rename World" : "Select World"}
      footer={
        renaming ? (
          <div className="mc-select-screen__actions">
            <label className="mc-rename-field">
              <span>World Name</span>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitRename();
                  if (event.key === "Escape") setRenaming(false);
                }}
                autoFocus
                maxLength={32}
              />
            </label>
            <div className="menu-buttons__row">
              <McOptionButton label="Done" onClick={commitRename} ellipsis={false} />
              <McOptionButton label="Cancel" onClick={() => setRenaming(false)} ellipsis={false} />
            </div>
          </div>
        ) : (
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
              <button
                type="button"
                className={`mc-button mc-button--quarter${undoStack.length ? "" : " mc-button--disabled"}`}
                disabled={!undoStack.length}
                onClick={undo}
              >
                Undo
              </button>
              <McDoneButton label="Cancel" size="quarter" />
            </div>
          </div>
        )
      }
    >
      {all.map((project) => {
        const isSelected = selected?.id === project.id;
        return (
          <Fragment key={project.id}>
            <ProjectRow
              project={project}
              displayName={names[project.id] ?? project.title}
              selected={selected}
              onSelect={(next) => {
                setSelected(next);
                setRenaming(false);
              }}
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
      {undoStack.length > 0 && (
        <div className="mc-inline-notice">
          {hidden.length
            ? `${hidden.length} world${hidden.length === 1 ? "" : "s"} hidden locally.`
            : "Last world change can still be undone."}
          <button type="button" className="mc-small-btn" onClick={undo}>
            Undo{undoStack.length > 1 ? ` (${undoStack.length})` : ""}
          </button>
        </div>
      )}
    </McSelectScreen>
  );
}

function ProjectRow({
  project,
  displayName,
  selected,
  onSelect,
}: {
  project: Project;
  displayName: string;
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
        <div className="mc-select-row__title">{displayName}</div>
        <div className="mc-select-row__sub">
          {project.type} · {project.scope} · {project.lastUpdated}
        </div>
      </div>
    </div>
  );
}
