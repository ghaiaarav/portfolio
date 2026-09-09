import type { Metadata } from "next";
import PanoramaBackground from "@/components/PanoramaBackground";
import { minecraftia, minecrafterAlt } from "@/lib/fonts";
import "@/styles/minecraft.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aaravghai.com"),
  title: {
    default: "Aarav Ghai",
    template: "%s | Aarav Ghai",
  },
  description:
    "Aarav Ghai — applied mathematics student at SJSU. Research in astrophysics, combinatorial topology, and CS. Projects, experience, and more.",
  openGraph: {
    title: "Aarav Ghai",
    description:
      "Applied math · physics · CS — research, projects, and experience at the intersection of theory and building.",
    url: "https://aaravghai.com",
    siteName: "Aarav Ghai",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aarav Ghai",
    description: "Applied math, physics, and CS — portfolio and research",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${minecraftia.variable} ${minecrafterAlt.variable}`}>
      <body>
        <PanoramaBackground />
        <div className="page-content">{children}</div>
        <footer className="mc-footer">
          <span>Portfolio v1.0</span>
          <span>© 2026 Aarav Ghai</span>
        </footer>
      </body>
    </html>
  );
}
