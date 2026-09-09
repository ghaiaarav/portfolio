"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";
import { useState } from "react";

export default function McOptionButton({
  href,
  label,
  external = false,
  size = "half",
  ellipsis = true,
}: {
  href: string;
  label: string;
  external?: boolean;
  size?: "half" | "full";
  ellipsis?: boolean;
}) {
  const { playClick } = useMcSound();
  const [pressed, setPressed] = useState(false);
  const className = `mc-button ${size === "half" ? "mc-button--half" : ""} ${pressed ? "mc-button--pressed" : ""}`;
  const displayLabel =
    ellipsis && !label.endsWith("...") ? `${label}...` : label;

  const handlers = {
    onPointerDown: () => {
      playClick();
      setPressed(true);
    },
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
  };

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
