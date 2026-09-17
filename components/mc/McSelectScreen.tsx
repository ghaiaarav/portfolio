"use client";

import McDoneButton from "@/components/mc/McDoneButton";
import type { ReactNode } from "react";

export default function McSelectScreen({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mc-menu-screen mc-select-screen">
      <div className="mc-select-screen__frame">
        <h1 className="mc-select-screen__title">{title}</h1>
        <div className="mc-select-screen__list">{children}</div>
        <div className="mc-select-screen__footer">
          {footer ?? (
            <div className="menu-buttons">
              <McDoneButton label="Cancel" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
