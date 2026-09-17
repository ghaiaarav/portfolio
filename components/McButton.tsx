"use client";

import Link from "next/link";
import { useMcSound } from "@/hooks/useMcSound";
import { type MouseEvent, type ReactNode, useState } from "react";

interface McButtonProps {
  href: string;
  labelDefault: string;
  labelHover: string;
  size?: "full" | "half";
  external?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export default function McButton({
  href,
  labelDefault,
  labelHover,
  size = "full",
  external = false,
  onClick,
  children,
}: McButtonProps) {
  const { playClick } = useMcSound();
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = () => {
    playClick();
    setPressed(true);
  };

  const handlePointerUp = () => setPressed(false);
  const handlePointerLeave = () => setPressed(false);

  const handleClick = (e: MouseEvent) => {
    onClick?.();
    if (external) return;
  };

  const className = `mc-button ${size === "half" ? "mc-button--half" : ""} ${pressed ? "mc-button--pressed" : ""}`;

  const inner = children ?? (
    <span className="mc-button__label">{labelDefault}</span>
  );

  if (external) {
    return (
      <span className="mc-button-wrap">
        <a
          href={href}
          className={className}
          aria-label={`${labelDefault}: ${labelHover}`}
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
        >
          {inner}
        </a>
      </span>
    );
  }

  return (
    <span className="mc-button-wrap">
      <Link
        href={href}
        prefetch
        className={className}
        aria-label={`${labelDefault}: ${labelHover}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        {inner}
      </Link>
    </span>
  );
}

interface McActionButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function McActionButton({ onClick, children, className = "" }: McActionButtonProps) {
  const { playClick } = useMcSound();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      className={`mc-button mc-button--half ${pressed ? "mc-button--pressed" : ""} ${className}`}
      style={{ width: "auto", minWidth: "120px" }}
      onPointerDown={() => {
        playClick();
        setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function McSmallButton({
  href,
  external,
  children,
  onClick,
}: {
  href?: string;
  external?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { playClick } = useMcSound();

  const props = {
    className: "mc-small-btn",
    onPointerDown: () => playClick(),
    onClick,
  };

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} prefetch {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function McTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { playClick } = useMcSound();

  return (
    <button
      type="button"
      className={`mc-tab ${active ? "mc-tab--active" : ""}`}
      onPointerDown={() => playClick()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
