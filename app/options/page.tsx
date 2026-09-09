import OptionsMenuClient from "@/components/options/OptionsMenuClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Options" };

export default function OptionsPage() {
  return <OptionsMenuClient />;
}
