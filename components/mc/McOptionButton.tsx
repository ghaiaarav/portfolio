"use client";

import Link from "next/link";
import { useExternalConfirmOptional } from "@/components/ExternalConfirmProvider";
import { needsExternalConfirm } from "@/lib/externalLinks";
import { useMcSound } from "@/hooks/useMcSound";
import { type MouseEvent, useState } from "react";

export default function McOptionButton({
  href,
  label,
  onClick,
  external = false,
  size = "half",
  ellipsis = true,
  className: extraClassName = "",
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  external?: boolean;
  size?: "half" | "full";
  ellipsis?: boolean;
  className?: string;
}) {
  const { playClick } = useMcSound();
  const confirm = useExternalConfirmOptional();
  const [pressed, setPressed] = useState(false);
  const className = `mc-button ${size === "half" ? "mc-button--half" : ""} ${pressed ? "mc-button--pressed" : ""} ${extraClassName}`;
  const displayLabel =
    ellipsis && !label.endsWith("...") ? `${label}...` : label;
  const confirmHref = Boolean(href && (external || needsExternalConfirm(href)));

  const handlers = {
    onPointerDown: () => {
      playClick();
      setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (confirmHref && href && confirm) {
        event.preventDefault();
        confirm.requestExternal(href);
        return;
      }
      onClick?.();
    },
  };

  if (!href) {
    return (
      <span className="mc-button-wrap">
        <button type="button" className={className} {...handlers}>
          {displayLabel}
        </button>
      </span>
    );
  }

  if (confirmHref) {
    return (
      <span className="mc-button-wrap">
        <a href={href} className={className} {...handlers}>
          {displayLabel}
        </a>
      </span>
    );
  }

  return (
    <span className="mc-button-wrap">
      <Link href={href} prefetch className={className} {...handlers}>
        {displayLabel}
      </Link>
    </span>
  );
}
