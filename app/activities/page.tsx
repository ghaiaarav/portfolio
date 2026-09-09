import ActivitiesClient from "@/components/ActivitiesClient";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activities" };

export default function ActivitiesPage() {
  const { activities } = getPortfolio();
  return <ActivitiesClient activities={activities} />;
}
