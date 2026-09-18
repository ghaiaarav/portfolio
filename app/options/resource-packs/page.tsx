import ResourcePacksScreen from "@/components/options/ResourcePacksScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Research Library" };

export default function ResourcePacksPage() {
  const { resources } = getPortfolio();
  return <ResourcePacksScreen resources={resources} />;
}
