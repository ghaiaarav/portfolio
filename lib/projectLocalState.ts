export type ProjectUndoAction =
  | { type: "hide"; id: string }
  | { type: "rename"; id: string; previous: string; next: string };

export function renameProject(
  names: Record<string, string>,
  id: string,
  name: string
): Record<string, string> {
  const trimmed = name.trim();
  if (!trimmed) return names;
  return { ...names, [id]: trimmed };
}

export function hideProject(hidden: string[], id: string): string[] {
  return hidden.includes(id) ? hidden : [...hidden, id];
}

export function restoreProject(hidden: string[], id: string): string[] {
  return hidden.filter((item) => item !== id);
}

export function pushUndo(
  stack: ProjectUndoAction[],
  action: ProjectUndoAction
): ProjectUndoAction[] {
  return [...stack, action];
}

export function undoLast(
  stack: ProjectUndoAction[],
  names: Record<string, string>,
  hidden: string[]
): {
  stack: ProjectUndoAction[];
  names: Record<string, string>;
  hidden: string[];
  restoredId: string | null;
} {
  const action = stack[stack.length - 1];
  if (!action) {
    return { stack, names, hidden, restoredId: null };
  }

  const nextStack = stack.slice(0, -1);
  if (action.type === "hide") {
    return {
      stack: nextStack,
      names,
      hidden: restoreProject(hidden, action.id),
      restoredId: action.id,
    };
  }

  const nextNames = { ...names };
  if (action.previous) nextNames[action.id] = action.previous;
  else delete nextNames[action.id];
  return { stack: nextStack, names: nextNames, hidden, restoredId: action.id };
}

export function undoStackFromHidden(hidden: string[]): ProjectUndoAction[] {
  return hidden.map((id) => ({ type: "hide" as const, id }));
}
