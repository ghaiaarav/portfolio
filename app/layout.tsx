import type { Metadata } from "next";
import McGuiProvider from "@/components/mc/McGuiProvider";
import EasterEggProvider from "@/components/easter-eggs/EasterEggProvider";
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
    "Please contact me at aaravghai2@gmail.com for inquiries.",
  openGraph: {
    title: "Aarav Ghai",
    description:
      "Applied Math @ SJSU",
    url: "https://aaravghai.com",
    siteName: "Aarav Ghai",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aarav Ghai",
    description: "Applied Math @ SJSU",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${minecraftia.variable} ${minecrafterAlt.variable}`}>
      <body>
        <McGuiProvider>
          <EasterEggProvider>
            <PanoramaBackground />
            <div className="page-content">{children}</div>
            <footer className="mc-footer">
              <span>Portfolio v1.1</span>
              <span>© 2026 Aarav Ghai</span>
            </footer>
          </EasterEggProvider>
        </McGuiProvider>
      </body>
    </html>
  );
}
