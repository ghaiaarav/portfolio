import localFont from "next/font/local";

export const minecraftia = localFont({
  src: "../public/fonts/minecraftia.ttf",
  variable: "--font-minecraftia",
  display: "swap",
  weight: "400",
  // Minecraftia draws its glyph cell (7 px caps + 1 px descender, on an 8 px
  // em) 4-12 glyph pixels above its baseline, and its own ascent/descent
  // (14/3 px) left every centred label ~3 px high. An ascent of 16 px and no
  // descent puts that cell exactly in the middle of the line box.
  declarations: [
    { prop: "ascent-override", value: "200%" },
    { prop: "descent-override", value: "0%" },
    { prop: "line-gap-override", value: "0%" },
  ],
});

export const minecrafterAlt = localFont({
  src: "../public/fonts/Minecrafter-Alt.ttf",
  variable: "--font-minecraft-logo",
  display: "swap",
  weight: "400",
});
