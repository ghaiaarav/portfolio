import GalleryScreen from "@/components/options/GalleryScreen";
import { getPortfolio } from "@/lib/portfolio";
import { parseMenuOrigin } from "@/lib/menuNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Photos & Videos" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ experience?: string | string[]; origin?: string | string[] }>;
}) {
  const params = await searchParams;
  const experienceId = Array.isArray(params.experience) ? params.experience[0] : params.experience;
  const portfolio = getPortfolio();
  const selected = portfolio.experience.find((item) => item.id === experienceId);
  return (
    <GalleryScreen
      experience={selected}
      origin={parseMenuOrigin(params.origin)}
    />
  );
}
