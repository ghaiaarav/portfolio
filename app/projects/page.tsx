import ProjectsClient from "@/components/ProjectsClient";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  const { projects } = getPortfolio();
  return <ProjectsClient projects={projects} />;
}
