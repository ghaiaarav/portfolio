import McOptionButton from "@/components/mc/McOptionButton";
import type { ReactNode } from "react";

export type McMenuItem = {
  href?: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
  ellipsis?: boolean;
};

export function McMenuGrid({ rows }: { rows: McMenuItem[][] }) {
  return (
    <div className="mc-menu-grid">
      {rows.map((row, i) => {
        const [left, right] = row;
        if (!left) return null;
        return (
          <div key={`${left.href ?? left.label}-${i}`} className="menu-buttons__row">
            <McOptionButton
              href={left.href}
              label={left.label}
              external={left.external}
              onClick={left.onClick}
              ellipsis={left.ellipsis}
            />
            {right ? (
              <McOptionButton
                href={right.href}
                label={right.label}
                external={right.external}
                onClick={right.onClick}
                ellipsis={right.ellipsis}
              />
            ) : (
              <span className="mc-button-wrap mc-button-wrap--spacer" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function McSettingsScroll({ children }: { children: ReactNode }) {
  return (
    <div className="mc-settings-scroll">
      <div className="mc-settings-grid">{children}</div>
    </div>
  );
}

export function McSettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mc-settings-option" role="listitem">
      <span className="mc-settings-option__text">
        {label}: {value}
      </span>
    </div>
  );
}
