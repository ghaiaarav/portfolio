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
  const { honors, skills } = getPortfolio();

  return (
    <McMenuScreen title="Skills" doneHref="/options" wide>
      <div className="mc-resource-columns">
        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Skill Loadout</div>
          <div className="mc-resource-column__list">
            {skills.map((skill) => (
              <div key={skill.category} className="mc-resource-entry">
                <div className="mc-resource-entry__icon">
                  <Image
                    src={
                      CATEGORY_IMAGES[skill.category] ??
                      (skill.category.startsWith("Physics")
                        ? "/resource-packs/physics.jpg"
                        : "/resource-packs/data-tools.jpg")
                    }
                    alt=""
                    fill
                    sizes="58px"
                  />
                </div>
                <div className="mc-resource-entry__text">
                  <div className="mc-resource-entry__name">{skill.category}</div>
                  <div className="mc-resource-entry__desc">
                    {skill.items.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mc-resource-column">
          <div className="mc-resource-column__title">Evidence & Milestones</div>
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
