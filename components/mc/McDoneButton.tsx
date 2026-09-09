"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";
import { useState } from "react";

export default function McDoneButton({
  href = "/",
  label = "Done",
}: {
  href?: string;
  label?: string;
}) {
  const { playClick } = useMcSound();
  const [pressed, setPressed] = useState(false);

  return (
    <span className="mc-button-wrap mc-button-wrap--full">
      <Link
        href={href}
        prefetch
        className={`mc-button ${pressed ? "mc-button--pressed" : ""}`}
        onPointerDown={() => {
          playClick();
          setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        {label}
      </Link>
    </span>
  );
}
