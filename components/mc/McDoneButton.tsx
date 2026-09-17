"use client";

import { useMcGuiOptional } from "@/components/mc/McGuiProvider";
import { useMcSound } from "@/hooks/useMcSound";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function McDoneButton({
  href,
  label = "Done",
  disabled = false,
  size = "full",
}: {
  href?: string;
  label?: string;
  disabled?: boolean;
  size?: "full" | "half" | "quarter";
}) {
  const { playClick } = useMcSound();
  const [pressed, setPressed] = useState(false);
  const router = useRouter();
  const gui = useMcGuiOptional();

  const handleClick = () => {
    if (disabled) return;
    playClick();
    if (href) {
      router.push(href);
    } else if (gui) {
      gui.goBack();
    } else {
      router.push("/");
    }
  };

  const wrapClass =
    size === "full" ? "mc-button-wrap--full" : size === "half" ? "mc-button-wrap--half" : "mc-button-wrap--quarter";
  const btnClass =
    size === "half" ? "mc-button--half" : size === "quarter" ? "mc-button--quarter" : "";

  return (
    <span className={`mc-button-wrap ${wrapClass}${disabled ? " mc-button-wrap--disabled" : ""}`}>
      <button
        type="button"
        disabled={disabled}
        className={`mc-button ${btnClass} ${pressed ? "mc-button--pressed" : ""} ${disabled ? "mc-button--disabled" : ""}`}
        onPointerDown={() => {
          if (!disabled) {
            setPressed(true);
          }
        }}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={handleClick}
      >
        {label}
      </button>
    </span>
  );
}
