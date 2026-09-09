import AchievementGrid from "@/components/AchievementGrid";
import McMenuScreen from "@/components/mc/McMenuScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shaders" };

export default function HonorsPage() {
  const { honors } = getPortfolio();
  return (
    <McMenuScreen title="Shaders" doneHref="/options">
      <div className="mc-menu-content">
        <AchievementGrid honors={honors} />
      </div>
    </McMenuScreen>
  );
}
