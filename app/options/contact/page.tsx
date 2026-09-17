import ContactScreen from "@/components/options/ContactScreen";
import { originDestination, parseMenuOrigin } from "@/lib/menuOrigin";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Me" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string }>;
}) {
  const params = await searchParams;
  return (
    <ContactScreen
      data={getPortfolio()}
      doneHref={originDestination(parseMenuOrigin(params.origin))}
    />
  );
}
