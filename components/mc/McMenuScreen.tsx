"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import type { ReactNode } from "react";

export default function McMenuScreen({
  title,
  wide = false,
  children,
  footer,
  doneLabel = "Done",
  doneHref,
}: {
  title: string;
  wide?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  doneLabel?: string;
  doneHref?: string;
}) {
  return (
    <main className="mc-menu-screen">
      <div
        className={`menu-column mc-menu-screen__column${wide ? " mc-menu-screen__column--wide" : ""}`}
      >
        <h1 className="mc-menu-screen__title">{title}</h1>
        <div className="mc-menu-screen__body">{children}</div>
        <div className="mc-menu-screen__footer">
          {footer ?? <McDoneButton href={doneHref} label={doneLabel} />}
        </div>
      </div>
    </main>
  );
}
