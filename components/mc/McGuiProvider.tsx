"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const FOV_KEY = "mc-fov";
const THEME_KEY = "mc-theme";
const ACCESSIBILITY_KEY = "mc-accessibility";
const MUTE_KEY = "mc-sound-muted";
const DEFAULT_FOV = 70;
const MIN_FOV = 30;
const MAX_FOV = 110;

export function fovLabel(fov: number): string {
  if (fov >= MAX_FOV) return "Quake Pro";
  if (fov === DEFAULT_FOV) return "Normal";
  return String(fov);
}

export function fovToPerspective(fov: number): number {
  const t = (fov - MIN_FOV) / (MAX_FOV - MIN_FOV);
  return Math.round(160 - t * 98);
}

export function fovToZoom(fov: number): number {
  const t = (fov - MIN_FOV) / (MAX_FOV - MIN_FOV);
  return Number((1.55 - t * 0.52).toFixed(3));
}

export function getParentPath(path: string): string {
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  if (clean === "/") return "/";
  const parts = clean.split("/").filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join("/")}` : "/";
}

type McGuiContextValue = {
  fov: number;
  setFov: (value: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  guiScale: "small" | "normal" | "large";
  setGuiScale: (value: "small" | "normal" | "large") => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  soundMuted: boolean;
  setSoundMuted: (value: boolean) => void;
  showToasts: boolean;
  setShowToasts: (value: boolean) => void;
  goBack: () => void;
  parentPath: string;
  stackDepth: number;
};

const McGuiContext = createContext<McGuiContextValue | null>(null);

export function useMcGui() {
  const ctx = useContext(McGuiContext);
  if (!ctx) throw new Error("useMcGui must be used within McGuiProvider");
  return ctx;
}

export function useMcGuiOptional() {
  return useContext(McGuiContext);
}

export default function McGuiProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [fov, setFovState] = useState(DEFAULT_FOV);
  const [darkMode, setDarkMode] = useState(false);
  const [guiScale, setGuiScale] = useState<"small" | "normal" | "large">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundMuted, setSoundMutedState] = useState(false);
  const [showToasts, setShowToasts] = useState(true);
  const [stack, setStack] = useState<string[]>(["/"]);

  useEffect(() => {
    const stored = localStorage.getItem(FOV_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed >= MIN_FOV && parsed <= MAX_FOV) {
        setFovState(parsed);
      }
    }
    setDarkMode(localStorage.getItem(THEME_KEY) === "dark");
    setSoundMutedState(localStorage.getItem(MUTE_KEY) === "true");
    try {
      const accessibility = JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY) ?? "{}");
      if (["small", "normal", "large"].includes(accessibility.guiScale)) {
        setGuiScale(accessibility.guiScale);
      }
      setHighContrast(Boolean(accessibility.highContrast));
      setReducedMotion(Boolean(accessibility.reducedMotion));
      setShowToasts(accessibility.showToasts !== false);
    } catch {
      localStorage.removeItem(ACCESSIBILITY_KEY);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--panorama-perspective",
      `${fovToPerspective(fov)}vmax`
    );
    document.documentElement.style.setProperty("--panorama-zoom", String(fovToZoom(fov)));
  }, [fov]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dataset.guiScale = guiScale;
    document.documentElement.dataset.highContrast = String(highContrast);
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    localStorage.setItem(
      ACCESSIBILITY_KEY,
      JSON.stringify({ guiScale, highContrast, reducedMotion, showToasts })
    );
  }, [guiScale, highContrast, reducedMotion, showToasts]);

  useEffect(() => {
    setStack((prev) => {
      const current = pathname || "/";
      if (prev[prev.length - 1] === current) return prev;
      const parent = getParentPath(current);
      if (prev.length > 1 && prev[prev.length - 2] === parent) {
        return [...prev.slice(0, -1), current];
      }
      if (prev.includes(current)) {
        const idx = prev.lastIndexOf(current);
        return prev.slice(0, idx + 1);
      }
      return [...prev, current];
    });
  }, [pathname]);

  const setFov = useCallback((value: number) => {
    const clamped = Math.min(MAX_FOV, Math.max(MIN_FOV, value));
    setFovState(clamped);
    localStorage.setItem(FOV_KEY, String(clamped));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const setSoundMuted = useCallback((value: boolean) => {
    setSoundMutedState(value);
    localStorage.setItem(MUTE_KEY, String(value));
  }, []);

  const parentPath = useMemo(() => getParentPath(pathname || "/"), [pathname]);

  const applyGuiScale = useCallback((value: "small" | "normal" | "large") => {
    document.documentElement.dataset.guiScale = value;
    setGuiScale(value);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) {
        router.push("/");
        return prev;
      }
      const next = prev.slice(0, -1);
      router.push(next[next.length - 1] ?? "/");
      return next;
    });
  }, [router]);

  const value = useMemo(
    () => ({
      fov,
      setFov,
      darkMode,
      toggleDarkMode,
      guiScale,
      setGuiScale: applyGuiScale,
      highContrast,
      setHighContrast,
      reducedMotion,
      setReducedMotion,
      soundMuted,
      setSoundMuted,
      showToasts,
      setShowToasts,
      goBack,
      parentPath,
      stackDepth: stack.length,
    }),
    [
      fov, setFov, darkMode, toggleDarkMode, guiScale, applyGuiScale, highContrast, reducedMotion,
      soundMuted, setSoundMuted, showToasts, goBack, parentPath, stack.length,
    ]
  );

  return <McGuiContext.Provider value={value}>{children}</McGuiContext.Provider>;
}
