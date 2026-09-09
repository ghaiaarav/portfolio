import McMenuScreen from "@/components/mc/McMenuScreen";
import WrittenBook from "@/components/WrittenBook";
import { getJourneyContent } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Language" };

export default function JourneyPage() {
  const journey = getJourneyContent();

  return (
    <McMenuScreen title="Language" doneHref="/options">
      <div className="mc-menu-content">
        {journey ? (
          <WrittenBook content={journey.content} />
        ) : (
          <p>Journey content coming soon.</p>
        )}
      </div>
    </McMenuScreen>
  );
}
