import SkillsScreen from "@/components/options/SkillsScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Skills" };

export default function HonorsPage() {
  const { resources } = getPortfolio();
  return <SkillsScreen resources={resources} />;
}
