"use client";

import BackButton from "@/components/BackButton";
import McButton from "@/components/McButton";
import McPanel from "@/components/McPanel";
import type { Portfolio } from "@/lib/portfolio";

export default function LinksClient({ links }: { links: Portfolio["links"] }) {
  return (
    <div className="mc-panel-page">
      <McPanel
        header={
          <div className="mc-panel__header">
            <BackButton label="Cancel" />
            <h2 className="mc-panel__title" style={{ margin: 0, flex: 1, textAlign: "center" }}>
              Leave the portfolio?
            </h2>
          </div>
        }
      >
        <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Connect with me elsewhere on the web:
        </p>
        <div className="menu-buttons" style={{ margin: "0 auto" }}>
          {links.map((link) => (
            <McButton
              key={link.label}
              href={link.url}
              labelDefault={link.label}
              labelHover={link.label}
              external
            />
          ))}
          <McButton href="/" labelDefault="Back to Menu" labelHover="Back to Menu" />
        </div>
      </McPanel>
    </div>
  );
}
