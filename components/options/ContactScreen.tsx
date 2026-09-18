"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import type { Portfolio } from "@/lib/portfolio";
import { originHref, type MenuOrigin } from "@/lib/menuNavigation";
import { useMcSound } from "@/hooks/useMcSound";

export default function ContactScreen({ data, origin }: { data: Portfolio; origin: MenuOrigin }) {
  const { playClick } = useMcSound();
  const rows: { icon: string; label: string; value: string; href: string }[] = [
    { icon: "letter", label: "Email", value: data.contact.email, href: `mailto:${data.contact.email}` },
    ...(data.contact.phone
      ? [{ icon: "redstone", label: "Phone", value: data.contact.phone, href: `tel:${data.contact.phone.replace(/\D/g, "")}` }]
      : []),
    { icon: "map", label: "LinkedIn", value: "ghaiaarav", href: data.contact.linkedin },
    { icon: "pickaxe", label: "GitHub", value: "ghaiaarav", href: data.contact.github },
    ...(data.contact.calendly
      ? [{ icon: "clock", label: "Book a call", value: "Choose a time", href: data.contact.calendly }]
      : []),
  ];

  return (
    <McMenuScreen title="Contact Me!" doneHref={originHref(origin)} wide>
      <div className="mc-contact-grid">
        {rows.map((row) => (
          <a
            key={row.href}
            href={row.href}
            className="mc-contact-card"
            target={row.href.startsWith("http") ? "_blank" : undefined}
            rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            onPointerDown={playClick}
          >
            <span className={`mc-contact-card__icon mc-contact-card__icon--${row.icon}`} aria-hidden="true" />
            <span>
              <strong>{row.label}</strong>
              <small>{row.value}</small>
            </span>
          </a>
        ))}
      </div>
    </McMenuScreen>
  );
}
