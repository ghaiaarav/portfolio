"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { KONAMI_KEYS, KONAMI_SWIPES, nextSequenceIndex, swipeDirection } from "@/lib/konami";
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
  const pathname = usePathname();
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
          ? `${next.length}/${DISCOVERY_IDS.length}`
          : `${next.length}/${DISCOVERY_IDS.length}`,
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
      position = nextSequenceIndex(position, key, KONAMI_KEYS);
      if (position === KONAMI_KEYS.length) {
        discover("konami");
        position = 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [discover]);

  useEffect(() => {
    if (pathname !== "/") return;
    let swipePos = 0;
    let tapsLeft = 0;
    let startX = 0;
    let startY = 0;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dir = swipeDirection(touch.clientX - startX, touch.clientY - startY);
      if (!dir) {
        if (swipePos === KONAMI_SWIPES.length && tapsLeft > 0) {
          tapsLeft -= 1;
          if (tapsLeft === 0) {
            discover("konami");
            swipePos = 0;
          }
        } else {
          swipePos = 0;
          tapsLeft = 0;
        }
        return;
      }
      swipePos = nextSequenceIndex(swipePos, dir, KONAMI_SWIPES);
      tapsLeft = swipePos === KONAMI_SWIPES.length ? 2 : 0;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [discover, pathname]);

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
        <aside
          className={`mc-advancement-toast mc-advancement-toast--${toast.frame}${toast.already ? " mc-advancement-toast--already" : ""}`}
          role="status"
        >
          <div className="mc-advancement-toast__slot" aria-hidden="true">
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
