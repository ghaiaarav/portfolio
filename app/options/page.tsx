import OptionsMenuClient from "@/components/options/OptionsMenuClient";
import { parseMenuOrigin } from "@/lib/menuNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Options" };

export default async function OptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ attention?: string | string[]; origin?: string | string[] }>;
}) {
  const params = await searchParams;
  const attention = Array.isArray(params.attention) ? params.attention[0] : params.attention;
  return <OptionsMenuClient attention={attention} origin={parseMenuOrigin(params.origin)} />;
}
