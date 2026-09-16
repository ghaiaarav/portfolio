"use client";

import McMenuScreen from "@/components/mc/McMenuScreen";
import McOptionButton from "@/components/mc/McOptionButton";
import type { Portfolio } from "@/lib/portfolio";

export default function ContactScreen({ data }: { data: Portfolio }) {
  const rows: { label: string; href: string; external?: boolean }[] = [
    { label: `Email: ${data.contact.email}`, href: `mailto:${data.contact.email}`, external: true },
    ...(data.contact.phone
      ? [{ label: `Phone: ${data.contact.phone}`, href: `tel:${data.contact.phone.replace(/\D/g, "")}`, external: true }]
      : []),
    { label: "LinkedIn", href: data.contact.linkedin, external: true },
    { label: "GitHub", href: data.contact.github, external: true },
    ...(data.contact.calendly
      ? [{ label: "Book a call", href: data.contact.calendly, external: true }]
      : []),
  ];

  return (
    <McMenuScreen title="Controls">
      <div className="mc-menu-grid">
        {rows.map((row) => (
          <div key={row.href} className="menu-buttons__row menu-buttons__row--single">
            <McOptionButton
              href={row.href}
              label={row.label}
              external={row.external}
              size="full"
              ellipsis={false}
            />
          </div>
        ))}
      </div>
    </McMenuScreen>
  );
}
