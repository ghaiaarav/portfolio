import TbaScreen from "@/components/options/TbaScreen";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const FEATURES = {
  music: "Music & Sounds",
  language: "Language",
  chat: "Chat Settings",
  record: "Record Screen",
} as const;

type Feature = keyof typeof FEATURES;

export function generateStaticParams() {
  return Object.keys(FEATURES).map((feature) => ({ feature }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feature: string }>;
}): Promise<Metadata> {
  const { feature } = await params;
  const title = FEATURES[feature as Feature];
  return { title: title ?? "Coming Soon" };
}

export default async function OptionsTbaPage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature } = await params;
  const title = FEATURES[feature as Feature];
  if (!title) notFound();

  return <TbaScreen title={title} doneHref="/options" />;
}
