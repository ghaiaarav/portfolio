import ContactScreen from "@/components/options/ContactScreen";
import { getPortfolio } from "@/lib/portfolio";
import { parseMenuOrigin } from "@/lib/menuNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Me" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string | string[] }>;
}) {
  const params = await searchParams;
  return <ContactScreen data={getPortfolio()} origin={parseMenuOrigin(params.origin)} />;
}
