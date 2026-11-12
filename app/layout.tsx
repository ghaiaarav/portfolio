import type { Metadata } from "next";
import ExternalConfirmProvider from "@/components/ExternalConfirmProvider";
import McGuiProvider from "@/components/mc/McGuiProvider";
import PanoramaBackground from "@/components/PanoramaBackground";
import EasterEggProvider from "@/components/easter-eggs/EasterEggProvider";
import SettingsEggWatcher from "@/components/easter-eggs/SettingsEggWatcher";
import { minecraftia, minecrafterAlt } from "@/lib/fonts";
import { getPortfolio } from "@/lib/portfolio";
import { PRE_PAINT_SCRIPT } from "@/lib/prePaint";
import { SITE_URL } from "@/lib/site";
import "@/styles/minecraft.css";

const DESCRIPTION =
  "Aarav Ghai: applied math student at SJSU working across graph theory, astrophysics, and computer science. A portfolio disguised as a Minecraft title screen.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aarav Ghai",
    template: "%s | Aarav Ghai",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Aarav Ghai",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Aarav Ghai",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aarav Ghai",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { version } = getPortfolio();
  return (
    // suppressHydrationWarning: the pre-paint script sets data-* attributes on <html> before React hydrates.
    <html lang="en" className={`${minecraftia.variable} ${minecrafterAlt.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body>
        <McGuiProvider>
          <ExternalConfirmProvider>
            <EasterEggProvider>
              <SettingsEggWatcher />
              <PanoramaBackground />
              <div className="page-content">{children}</div>
              <footer className="mc-footer">
                <span>{version}</span>
                <span>© 2026 Aarav Ghai</span>
              </footer>
            </EasterEggProvider>
          </ExternalConfirmProvider>
        </McGuiProvider>
      </body>
    </html>
  );
}
