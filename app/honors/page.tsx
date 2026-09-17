import McMenuScreen from "@/components/mc/McMenuScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Skills" };

const CATEGORY_IMAGES: Record<string, string> = {
  Mathematics: "/resource-packs/mathematics.jpg",
  Physics: "/resource-packs/physics.jpg",
  "Computer Science": "/resource-packs/computer-science.jpg",
  Leadership: "/resource-packs/sjsu.jpg",
  Other: "/activities/skycofl.png",
  Academic: "/resource-packs/sjsu.jpg",
};

function honorImage(title: string, category: string) {
  if (title.includes("SciRavens")) return "/activities/sciravens.webp";
  return CATEGORY_IMAGES[category] ?? "/resource-packs/data-tools.jpg";
}

export default function HonorsPage() {
  const { honors } = getPortfolio();
  const categories = [...new Set(honors.map((honor) => honor.category))];

  return (
    <McMenuScreen title="Skills" doneHref="/options" wide>
      <div className="mc-resource-columns">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Skill Areas</div>
          <div className="mc-resource-column__list">
            {categories.map((category) => (
              <div key={category} className="mc-resource-entry">
                <div className="mc-resource-entry__icon">
                  <Image
                    src={CATEGORY_IMAGES[category] ?? "/resource-packs/data-tools.jpg"}
                    alt=""
                    fill
                    sizes="58px"
                  />
                </div>
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{category}</div>
                  <div className="mc-resource-entry__desc">
                    {honors.filter((honor) => honor.category === category).length} unlocked
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Achievements</div>
          <div className="mc-resource-column__list">
            {honors.map((honor) => (
              <div key={`${honor.title}-${honor.year}`} className="mc-resource-entry">
                <div className="mc-resource-entry__icon">
                  <Image
                    src={honorImage(honor.title, honor.category)}
                    alt=""
                    fill
                    sizes="58px"
                  />
                </div>
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{honor.title}</div>
                  <div className="mc-resource-entry__desc">
                    {honor.detail} · {honor.year}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </McMenuScreen>
  );
}
