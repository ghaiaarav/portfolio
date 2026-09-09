import ResourcePacksScreen from "@/components/options/ResourcePacksScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resource Packs" };

export default function ResourcePacksPage() {
  const { skills, education } = getPortfolio();
  return <ResourcePacksScreen skills={skills} education={education} />;
}
