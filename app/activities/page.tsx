import ActivitiesClient from "@/components/ActivitiesClient";
import { isActivityTab } from "@/lib/activityTabs";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Extracurriculars" };

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { activities } = getPortfolio();
  const { tab } = await searchParams;
  const initialTab = isActivityTab(tab) ? tab : undefined;
  // Keyed so a client-side navigation to a different ?tab= remounts with that tab.
  return <ActivitiesClient key={initialTab ?? "default"} activities={activities} initialTab={initialTab} />;
}
