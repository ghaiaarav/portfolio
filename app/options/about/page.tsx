import AboutScreen from "@/components/options/AboutScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Skin Customization" };

export default function AboutPage() {
  return <AboutScreen data={getPortfolio()} />;
}
