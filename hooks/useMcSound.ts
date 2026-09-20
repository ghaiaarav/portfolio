"use client";

import { useCallback, useEffect, useRef } from "react";

const POOL_SIZE = 4;
const MUTE_KEY = "mc-sound-muted";
const CLICK_SRC = "/sounds/click.ogg";
const THUNDER_SRC = "/sounds/thunder.wav";

let pool: HTMLAudioElement[] | null = null;
let poolIndex = 0;
let unlocked = false;
let thunder: HTMLAudioElement | null = null;

function getThunder() {
  if (!thunder) {
    thunder = new Audio(THUNDER_SRC);
    thunder.preload = "auto";
    thunder.volume = 0.7;
  }
  return thunder;
}

function getPool(): HTMLAudioElement[] {
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(CLICK_SRC);
      audio.preload = "auto";
      audio.volume = 0.5;
      return audio;
    });
  }
  return pool;
}

function playFromPool() {
  const audioPool = getPool();
  const audio = audioPool[poolIndex % POOL_SIZE];
  poolIndex = (poolIndex + 1) % POOL_SIZE;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // Autoplay blocked or audio unavailable
  });
}

export function preloadMcClick() {
  if (typeof window === "undefined") return;
  getPool();
  getThunder();
}

export function useMcSound() {
  const unlockRef = useRef(false);

  const unlock = useCallback(() => {
    if (unlocked || unlockRef.current) return;
    unlockRef.current = true;
    unlocked = true;
    preloadMcClick();
  }, []);

  useEffect(() => {
    preloadMcClick();
    const handler = () => unlock();
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [unlock]);

  const playClick = useCallback(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    unlock();
    playFromPool();
  }, [unlock]);

  const playThunder = useCallback(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(MUTE_KEY) === "true") return;
    unlock();
    const audio = getThunder();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, [unlock]);

  return { playClick, playThunder, unlock };
}

export function playMcClick() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MUTE_KEY) === "true") return;
  playFromPool();
}
