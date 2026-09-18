import GlobeButton from "@/components/GlobeButton";
import HomeSkinViewer from "@/components/HomeSkinViewer";
import McButton from "@/components/McButton";
import SplashText from "@/components/SplashText";
import TitleLogo from "@/components/TitleLogo";
import { getPortfolio } from "@/lib/portfolio";

export default function MainMenu() {
  const { splashTexts, resume } = getPortfolio();

  return (
    <main className="main-menu">
      <div className="menu-column">
        <div className="logo-area">
          <TitleLogo />
          <SplashText texts={splashTexts} />
        </div>

        <div className="menu-buttons">
          <McButton href="/projects" labelDefault="Singleplayer" labelHover="Projects" />
          <McButton href="/experience" labelDefault="Multiplayer" labelHover="Experience" />
          <McButton href="/activities" labelDefault="Extracurriculars" labelHover="Activities" />
          <div className="menu-buttons__row menu-buttons__row--split">
            <GlobeButton href={resume.url} />
            <McButton href="/options" labelDefault="Options..." labelHover="About" size="half" />
            <McButton
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              labelDefault="Surprise Me!"
              labelHover="Click if you dare"
              size="half"
              external
            />
          </div>
        </div>
      </div>
      <HomeSkinViewer />
    </main>
  );
}
