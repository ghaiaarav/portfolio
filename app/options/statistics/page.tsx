import StatisticsScreen from "@/components/options/StatisticsScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Video Settings" };

export default function StatisticsPage() {
  const { statistics } = getPortfolio();
  return <StatisticsScreen statistics={statistics} />;
}
