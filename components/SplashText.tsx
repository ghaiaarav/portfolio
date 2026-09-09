"use client";

import { useCallback, useEffect, useState } from "react";
import { useMcSound } from "@/hooks/useMcSound";

interface SplashTextProps {
  texts: string[];
  cycleInterval?: number;
}

export default function SplashText({ texts, cycleInterval = 10000 }: SplashTextProps) {
  const { playClick } = useMcSound();
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * texts.length));
  }, [texts.length]);

  const advance = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * texts.length);
        while (next === prev && texts.length > 1) {
          next = Math.floor(Math.random() * texts.length);
        }
        return next;
      });
      setFading(false);
    }, 300);
  }, [texts.length]);

  useEffect(() => {
    const timer = setInterval(advance, cycleInterval);
    return () => clearInterval(timer);
  }, [advance, cycleInterval]);

  const handleClick = () => {
    playClick();
    advance();
  };

  if (texts.length === 0) return null;

  return (
    <div
      className={`splash-text ${fading ? "splash-text--fade" : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      title="Click to cycle splash text"
    >
      {texts[index]}
    </div>
  );
}
