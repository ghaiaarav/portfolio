"use client";

import Link from "next/link";
import { useMcGui } from "@/components/mc/McGuiProvider";
import {
  ADVANCEMENTS,
  CHALLENGE_COMPLETE,
  DISCOVERY_IDS,
  addDiscovery,
  isSecretRoomUnlocked,
  normalizeDiscoveries,
  type AdvancementFrame,
  type DiscoveryId,
} from "@/lib/discoveries";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export { DISCOVERY_IDS };
export type { DiscoveryId };

const STORAGE_KEY = "mc-discoveries";
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

type AdvancementToast = {
  header: string;
  name: string;
  icon: string;
  frame: AdvancementFrame;
  status: string;
  already?: boolean;
  link?: boolean;
};

type EggContextValue = {
  found: DiscoveryId[];
  discover: (id: DiscoveryId) => void;
  isFound: (id: DiscoveryId) => boolean;
  complete: boolean;
};

const EggContext = createContext<EggContextValue | null>(null);

export function useEasterEggs() {
  const context = useContext(EggContext);
  if (!context) throw new Error("useEasterEggs must be used inside EasterEggProvider");
  return context;
}

export default function EasterEggProvider({ children }: { children: ReactNode }) {
  const { showToasts } = useMcGui();
  const [found, setFound] = useState<DiscoveryId[]>([]);
  const [toast, setToast] = useState<AdvancementToast | null>(null);

  useEffect(() => {
    try {
      setFound(normalizeDiscoveries(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const discover = useCallback((id: DiscoveryId) => {
    setFound((current) => {
      const advancement = ADVANCEMENTS[id];
      const already = current.includes(id);
      const next = already ? current : addDiscovery(current, id);
      if (!already) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      const remaining = DISCOVERY_IDS.length - next.length;
      const complete = remaining === 0;
      setToast({
        ...(complete && !already ? CHALLENGE_COMPLETE : advancement),
        header: already
          ? "Already discovered!"
          : complete
            ? CHALLENGE_COMPLETE.header
            : advancement.header,
        name: already ? advancement.name : complete ? CHALLENGE_COMPLETE.name : advancement.name,
        status: already
          ? `Already found · ${next.length}/${DISCOVERY_IDS.length}`
          : `${next.length}/${DISCOVERY_IDS.length} discovered · ${remaining} left`,
        already,
        link: complete,
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let position = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      position = key === KONAMI[position] ? position + 1 : key === KONAMI[0] ? 1 : 0;
      if (position === KONAMI.length) {
        discover("konami");
        position = 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [discover]);

  const value = useMemo(
    () => ({
      found,
      discover,
      isFound: (id: DiscoveryId) => found.includes(id),
      complete: isSecretRoomUnlocked(found),
    }),
    [discover, found]
  );

  return (
    <EggContext.Provider value={value}>
      {children}
      {toast && showToasts && (
        <aside className={`mc-advancement-toast mc-advancement-toast--${toast.frame}${toast.already ? " mc-advancement-toast--already" : ""}`} role="status">
          <div className="mc-advancement-toast__icon" aria-hidden="true">
            <img src={toast.icon} alt="" width={32} height={32} />
          </div>
          <div className="mc-advancement-toast__body">
            <strong>{toast.header}</strong>
            <span>{toast.name}</span>
            <em>{toast.status}</em>
            {toast.link && <Link href="/secret-room">Enter Secret Room</Link>}
          </div>
        </aside>
      )}
    </EggContext.Provider>
  );
}
