"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";
import { useState } from "react";

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
  const [pressed, setPressed] = useState(false);
  const className = `mc-button ${size === "half" ? "mc-button--half" : ""} ${pressed ? "mc-button--pressed" : ""} ${extraClassName}`;
  const displayLabel =
    ellipsis && !label.endsWith("...") ? `${label}...` : label;

  const handlers = {
    onPointerDown: () => {
      playClick();
      setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onClick,
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

  if (external) {
    return (
      <span className="mc-button-wrap">
        <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...handlers}>
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
