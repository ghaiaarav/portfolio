"use client";

import dynamic from "next/dynamic";

const HomeSkinViewer = dynamic(() => import("@/components/HomeSkinViewer"), { ssr: false });

export default function HomeSkinViewerLazy() {
  return <HomeSkinViewer />;
}
