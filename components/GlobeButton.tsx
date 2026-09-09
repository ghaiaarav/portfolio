"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";

export default function GlobeButton({ href }: { href: string }) {
  const { playClick } = useMcSound();

  return (
    <Link
      href={href}
      className="globe-button"
      title="Resume"
      target="_blank"
      onPointerDown={() => playClick()}
    >
      <span className="globe-button__icon" aria-hidden="true" />
    </Link>
  );
}
