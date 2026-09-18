import McMenuScreen from "@/components/mc/McMenuScreen";
import { getPortfolio } from "@/lib/portfolio";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Skills" };

const CATEGORY_IMAGES: Record<string, string> = {
  Mathematics: "/resource-packs/mathematics.jpg",
  Physics: "/resource-packs/physics.jpg",
  "Physics & Astrophysics": "/resource-packs/physics.jpg",
  "Computer Science": "/resource-packs/computer-science.jpg",
  "Data & Tools": "/resource-packs/data-tools.jpg",
  Leadership: "/resource-packs/sjsu.jpg",
  Academic: "/resource-packs/sjsu.jpg",
  Other: "/activities/skycofl.png",
};

export default function HonorsPage() {
  const { skills, honors } = getPortfolio();

  return (
    <McMenuScreen title="Skills" doneHref="/options" wide>
      <div className="mc-resource-columns mc-resource-columns--flow">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Capabilities</div>
          <div className="mc-resource-column__list">
            {skills.map((group) => (
              <div key={group.category} className="mc-resource-entry">
                <div className="mc-resource-entry__icon">
                  <Image
                    src={CATEGORY_IMAGES[group.category] ?? "/resource-packs/data-tools.jpg"}
                    alt=""
                    fill
                    sizes="58px"
                  />
                </div>
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{group.category}</div>
                  <div className="mc-resource-entry__desc">{group.items.join(" · ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Evidence</div>
          <div className="mc-resource-column__list">
            {honors.map((honor) => (
              <div key={`${honor.title}-${honor.year}`} className="mc-resource-entry">
                <div className="mc-resource-entry__icon">
                  <Image
                    src={CATEGORY_IMAGES[honor.category] ?? "/resource-packs/data-tools.jpg"}
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
