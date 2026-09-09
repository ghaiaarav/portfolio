"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import type { ReactNode } from "react";

export default function McMenuScreen({
  title,
  doneHref = "/",
  doneLabel = "Done",
  wide = false,
  children,
  footer,
}: {
  title: string;
  doneHref?: string;
  doneLabel?: string;
  wide?: boolean;
  children: ReactNode;
  footer?: ReactNode;
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
