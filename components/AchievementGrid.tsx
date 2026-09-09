import type { Portfolio } from "@/lib/portfolio";

const CATEGORY_ICONS: Record<string, string> = {
  STEM: "⚙",
  Academic: "📚",
  Music: "🎵",
  Other: "⭐",
};

interface AchievementGridProps {
  honors: Portfolio["honors"];
}

export default function AchievementGrid({ honors }: AchievementGridProps) {
  const categories = [...new Set(honors.map((h) => h.category))];

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} className="category-section">
          <h3 className="category-section__title">{cat}</h3>
          <div className="achievement-grid">
            {honors
              .filter((h) => h.category === cat)
              .map((honor) => (
                <div key={`${honor.title}-${honor.year}`} className="achievement-tile">
                  <div className="achievement-tile__icon">
                    {CATEGORY_ICONS[honor.category] ?? "🏆"}
                  </div>
                  <div className="achievement-tile__title">{honor.title}</div>
                  <div className="achievement-tile__detail">
                    {honor.year} — {honor.detail}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
