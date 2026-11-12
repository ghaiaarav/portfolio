"use client";

import { needsExternalConfirm } from "@/lib/externalLinks";
import { useMcSound } from "@/hooks/useMcSound";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type ConfirmContextValue = {
  requestExternal: (url: string) => void;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useExternalConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useExternalConfirm must be used within ExternalConfirmProvider");
  return ctx;
}

export function useExternalConfirmOptional() {
  return useContext(ConfirmContext);
}

export default function ExternalConfirmProvider({ children }: { children: ReactNode }) {
  const { playClick } = useMcSound();
  const [url, setUrl] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const requestExternal = useCallback((next: string) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setUrl(next);
  }, []);

  useEffect(() => {
    if (!url) return;
    // Move focus into the dialog (the safe choice) and let Escape dismiss it.
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setUrl(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [url]);

  return (
    <ConfirmContext.Provider value={{ requestExternal }}>
      {children}
      {url && (
        <div className="mc-confirm-overlay" role="presentation">
          <div
            className="mc-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mc-confirm-title"
          >
            <h2 id="mc-confirm-title">This links to an external site</h2>
            <p className="mc-confirm-dialog__url">{url}</p>
            <div className="menu-buttons__row">
              <span className="mc-button-wrap">
                <a
                  href={url}
                  className="mc-button mc-button--half"
                  onClick={() => playClick()}
                >
                  Proceed
                </a>
              </span>
              <span className="mc-button-wrap">
                <button
                  ref={cancelRef}
                  type="button"
                  className="mc-button mc-button--half"
                  onClick={() => {
                    playClick();
                    setUrl(null);
                  }}
                >
                  Don&apos;t
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function ConfirmLink({
  href,
  className,
  children,
  title,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const confirm = useExternalConfirmOptional();
  const { playClick } = useMcSound();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    playClick();
    if (!needsExternalConfirm(href) || !confirm) return;
    event.preventDefault();
    confirm.requestExternal(href);
  };

  return (
    <a href={href} className={className} title={title} onClick={onClick}>
      {children}
    </a>
  );
}
