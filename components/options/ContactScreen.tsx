"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import { useMcSound } from "@/hooks/useMcSound";
import type { Portfolio } from "@/lib/portfolio";

export default function ContactScreen({
  data,
  doneHref,
}: {
  data: Portfolio;
  doneHref: string;
}) {
  const { playClick } = useMcSound();
  const rows: { label: string; value: string; href: string; icon: string }[] = [
    { label: "Email", value: data.contact.email, href: `mailto:${data.contact.email}`, icon: "@" },
    ...(data.contact.phone
      ? [{ label: "Phone", value: data.contact.phone, href: `tel:${data.contact.phone.replace(/\D/g, "")}`, icon: "☎" }]
      : []),
    { label: "LinkedIn", value: "Connect professionally", href: data.contact.linkedin, icon: "in" },
    { label: "GitHub", value: "Browse repositories", href: data.contact.github, icon: "<>" },
    ...(data.contact.calendly
      ? [{ label: "Book a call", value: "Choose a time", href: data.contact.calendly, icon: "⌚" }]
      : []),
  ];

  return (
    <McMenuScreen title="Contact Me!" doneHref={doneHref} wide>
      <div className="mc-contact-grid">
        {rows.map((row) => (
          <a
            key={row.href}
            className="mc-contact-card"
            href={row.href}
            target={row.href.startsWith("http") ? "_blank" : undefined}
            rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            onPointerDown={playClick}
          >
            <span className="mc-contact-card__icon" aria-hidden="true">{row.icon}</span>
            <span className="mc-contact-card__copy">
              <strong>{row.label}</strong>
              <span>{row.value}</span>
            </span>
            <span className="mc-contact-card__arrow" aria-hidden="true">→</span>
          </a>
        ))}
      </div>
    </McMenuScreen>
  );
}
