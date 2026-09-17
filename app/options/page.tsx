import OptionsMenuClient from "@/components/options/OptionsMenuClient";
import { parseMenuOrigin } from "@/lib/menuOrigin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Options" };

export default async function OptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; origin?: string }>;
}) {
  const params = await searchParams;
  return (
    <OptionsMenuClient
      highlightContact={params.prompt === "contact"}
      origin={parseMenuOrigin(params.origin)}
    />
  );
}
