"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";

export default function TbaScreen({
  title,
  doneHref,
}: {
  title: string;
  doneHref: string;
}) {
  return (
    <McMenuScreen title={title} doneHref={doneHref}>
      <div className="mc-tba-panel">
        <div className="mc-tba-panel__icon" aria-hidden="true">
          ?
        </div>
        <p>Feature coming soon.</p>
      </div>
    </McMenuScreen>
  );
}
