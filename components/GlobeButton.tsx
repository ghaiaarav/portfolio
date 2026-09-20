"use client";

import { ConfirmLink } from "@/components/ExternalConfirmProvider";

export default function GlobeButton({ href }: { href: string }) {
  return (
    <ConfirmLink href={href} className="globe-button" title="Resume">
      <span className="globe-button__icon" aria-hidden="true" />
    </ConfirmLink>
  );
}
