import ExperienceClient from "@/components/ExperienceClient";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  const { experience, openToWork } = getPortfolio();
  return <ExperienceClient experience={experience} openToWork={openToWork} />;
}
