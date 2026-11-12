import type { ReactNode } from "react";

/** The title-screen logo: authentic 3D cracked stone Minecraft logo. */
export default function TitleLogo({ children }: { children?: ReactNode }) {
  return (
    <div className="title-logo-wrap">
      <h1 className="title-logo">
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel art must not be resampled by the optimizer */}
        <img
          className="title-logo__image"
          src="/title/logo-textured.png"
          alt="Aarav Ghai"
          width={937}
          height={155}
          fetchPriority="high"
          draggable={false}
        />
      </h1>
      {children}
    </div>
  );
}
