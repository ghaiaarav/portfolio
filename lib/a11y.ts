import type { KeyboardEvent } from "react";

/** Make a `role="button"` element respond to Enter and Space like a real button. */
export function activateOnKey(event: KeyboardEvent<HTMLElement>) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}
