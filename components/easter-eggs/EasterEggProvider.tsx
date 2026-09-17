"use client";

import { useMcGui } from "@/components/mc/McGuiProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DiscoveryId =
  | "skin-cycle"
  | "konami"
  | "quake-night"
  | "lost-server"
  | "gallery-photo";

const DISCOVERY_KEY = "mc-discoveries";
const TOTAL_DISCOVERIES = 5;
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type DiscoveryContextValue = {
  discovered: DiscoveryId[];
  count: number;
  total: number;
  unlocked: boolean;
  discover: (id: DiscoveryId, title: string) => void;
};

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

export function useDiscoveries() {
  const value = useContext(DiscoveryContext);
  if (!value) throw new Error("useDiscoveries must be used within EasterEggProvider");
  return value;
}

export default function EasterEggProvider({ children }: { children: ReactNode }) {
  const { darkMode, fov, showToasts } = useMcGui();
  const [discovered, setDiscovered] = useState<DiscoveryId[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(DISCOVERY_KEY) ?? "[]");
      if (Array.isArray(stored)) setDiscovered(stored.slice(0, TOTAL_DISCOVERIES));
    } catch {
      localStorage.removeItem(DISCOVERY_KEY);
    }
  }, []);

  const discover = useCallback((id: DiscoveryId, title: string) => {
    setDiscovered((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(next));
      const progress = next.length;
      setToast(
        progress === TOTAL_DISCOVERIES
          ? `${title} All ${TOTAL_DISCOVERIES} discoveries found. The Secret Room is now open!`
          : `${title} You found an easter egg. Find all ${TOTAL_DISCOVERIES} to reveal a surprise! Current count: ${progress}/${TOTAL_DISCOVERIES}`
      );
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 6500);
      return next;
    });
  }, []);

  useEffect(() => {
    let position = 0;
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      position = key === KONAMI[position] ? position + 1 : key === KONAMI[0] ? 1 : 0;
      if (position === KONAMI.length) {
        discover("konami", "Code accepted.");
        position = 0;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [discover]);

  useEffect(() => {
    if (darkMode && fov >= 110) {
      discover("quake-night", "Quake Pro sees through the night.");
    }
  }, [darkMode, discover, fov]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  const value = useMemo(
    () => ({
      discovered,
      count: discovered.length,
      total: TOTAL_DISCOVERIES,
      unlocked: discovered.length >= TOTAL_DISCOVERIES,
      discover,
    }),
    [discover, discovered]
  );

  return (
    <DiscoveryContext.Provider value={value}>
      {children}
      {toast && showToasts && (
        <div className="mc-advancement-toast" role="status" aria-live="polite">
          <span className="mc-advancement-toast__icon" aria-hidden="true">◆</span>
          <span>
            <strong>Advancement Made!</strong>
            {toast}
          </span>
        </div>
      )}
    </DiscoveryContext.Provider>
  );
}
