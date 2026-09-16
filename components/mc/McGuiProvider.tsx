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
const DEFAULT_FOV = 70;
const MIN_FOV = 30;
const MAX_FOV = 110;

export function fovLabel(fov: number): string {
  if (fov <= 35) return "Quake Pro";
  if (fov >= 95) return "Wide";
  if (fov >= 80) return "Normal";
  return "Normal";
}

export function fovToBlur(fov: number): number {
  const t = (fov - MIN_FOV) / (MAX_FOV - MIN_FOV);
  return Math.round(16 - t * 16);
}

export function fovToDuration(fov: number): number {
  const t = (fov - MIN_FOV) / (MAX_FOV - MIN_FOV);
  return Math.round(240 - t * 180);
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
  const [stack, setStack] = useState<string[]>(["/"]);

  useEffect(() => {
    const stored = localStorage.getItem(FOV_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed >= MIN_FOV && parsed <= MAX_FOV) {
        setFovState(parsed);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--panorama-blur", `${fovToBlur(fov)}px`);
    document.documentElement.style.setProperty("--panorama-duration", `${fovToDuration(fov)}s`);
  }, [fov]);

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

  const parentPath = useMemo(() => getParentPath(pathname || "/"), [pathname]);

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
      goBack,
      parentPath,
      stackDepth: stack.length,
    }),
    [fov, setFov, goBack, parentPath, stack.length]
  );

  return <McGuiContext.Provider value={value}>{children}</McGuiContext.Provider>;
}
