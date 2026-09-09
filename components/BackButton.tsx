"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";

export default function BackButton({
  label = "Done",
  href = "/",
}: {
  label?: string;
  href?: string;
}) {
  const { playClick } = useMcSound();

  return (
    <Link
      href={href}
      prefetch
      className="back-button"
      onPointerDown={() => playClick()}
    >
      ← {label}
    </Link>
  );
}
