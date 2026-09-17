import LogsScreen from "@/components/options/LogsScreen";
import { getRepositoryLogs } from "@/lib/repositoryLogs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Logs" };

export default async function LogsPage() {
  return <LogsScreen logs={await getRepositoryLogs()} />;
}
