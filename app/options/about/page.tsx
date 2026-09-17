import AboutScreen from "@/components/options/AboutScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Me" };

export default function AboutPage() {
  return <AboutScreen data={getPortfolio()} />;
}
