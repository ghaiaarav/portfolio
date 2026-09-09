import ContactScreen from "@/components/options/ContactScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Controls" };

export default function ContactPage() {
  return <ContactScreen data={getPortfolio()} />;
}
