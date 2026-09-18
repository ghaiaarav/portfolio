/**
 * Steve-model skin variants and advancement item icons.
 * Run: node scripts/generate-portfolio-extras.mjs
 */
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skinsDir = join(root, "public", "skins");
const iconsDir = join(root, "public", "textures", "advancements");

mkdirSync(skinsDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

function fillRect(data, width, x0, y0, w, h, r, g, b) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
}

function shadeRect(data, width, x0, y0, w, h, r, g, b) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const i = (y * width + x) * 4;
      const n = ((x + y) % 3) - 1;
      data[i] = Math.min(255, Math.max(0, r + n * 8));
      data[i + 1] = Math.min(255, Math.max(0, g + n * 8));
      data[i + 2] = Math.min(255, Math.max(0, b + n * 8));
      data[i + 3] = 255;
    }
  }
}

function paintCoat(data, width, color) {
  const [r, g, b] = color;
  // Body + jacket overlay (classic 64x64 Steve UVs)
  shadeRect(data, width, 16, 20, 24, 12, r, g, b);
  shadeRect(data, width, 16, 36, 24, 12, Math.min(255, r + 18), Math.min(255, g + 18), Math.min(255, b + 18));
  // Arms + overlays
  shadeRect(data, width, 40, 20, 16, 12, r, g, b);
  shadeRect(data, width, 40, 36, 16, 12, Math.min(255, r + 12), Math.min(255, g + 12), Math.min(255, b + 12));
  shadeRect(data, width, 32, 52, 16, 12, r, g, b);
  shadeRect(data, width, 48, 52, 16, 12, Math.min(255, r + 12), Math.min(255, g + 12), Math.min(255, b + 12));
}

async function makeSteveVariant(name, painter) {
  const image = sharp(join(root, "public", "skins", "steve.png")).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  painter(data, info.width);
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(join(skinsDir, name));
}

function makeIcon(name, painter) {
  const size = 32;
  const data = Buffer.alloc(size * size * 4);
  painter(data, size);
  return sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(iconsDir, name));
}

async function main() {
  await makeSteveVariant("scientist.png", (data, width) => {
    paintCoat(data, width, [236, 236, 240]);
    fillRect(data, width, 23, 20, 2, 12, 28, 28, 36); // tie
    fillRect(data, width, 23, 36, 2, 12, 28, 28, 36);
  });
  await makeSteveVariant("intern.png", (data, width) => {
    paintCoat(data, width, [22, 38, 62]); // navy intern sweater
    fillRect(data, width, 16, 24, 24, 8, 214, 118, 28); // safety stripe
    fillRect(data, width, 16, 40, 24, 8, 214, 118, 28);
  });
  await makeSteveVariant("pianist.png", (data, width) => {
    paintCoat(data, width, [18, 18, 22]); // tuxedo
    fillRect(data, width, 22, 20, 4, 12, 236, 236, 240); // shirt
    fillRect(data, width, 22, 36, 4, 12, 236, 236, 240);
    fillRect(data, width, 23, 20, 2, 3, 18, 18, 22); // bowtie
  });

  await makeIcon("skin.png", (data, size) => {
    fillRect(data, size, 8, 6, 16, 16, 189, 148, 117);
    fillRect(data, size, 8, 6, 16, 6, 46, 32, 22);
    fillRect(data, size, 11, 14, 3, 3, 62, 84, 140);
    fillRect(data, size, 18, 14, 3, 3, 62, 84, 140);
    fillRect(data, size, 13, 19, 6, 2, 140, 90, 70);
  });
  await makeIcon("konami.png", (data, size) => {
    fillRect(data, size, 4, 4, 24, 24, 92, 48, 148);
    fillRect(data, size, 6, 6, 20, 20, 48, 22, 78);
    fillRect(data, size, 14, 8, 4, 10, 230, 210, 80);
    fillRect(data, size, 11, 18, 10, 4, 230, 210, 80);
  });
  await makeIcon("settings.png", (data, size) => {
    fillRect(data, size, 6, 14, 20, 8, 168, 28, 28);
    fillRect(data, size, 10, 10, 12, 16, 210, 48, 42);
    fillRect(data, size, 14, 6, 4, 22, 120, 16, 16);
  });
  await makeIcon("server.png", (data, size) => {
    fillRect(data, size, 8, 8, 16, 16, 48, 160, 48);
    fillRect(data, size, 8, 18, 16, 6, 110, 78, 42);
    fillRect(data, size, 14, 4, 4, 8, 70, 48, 28);
  });
  await makeIcon("gallery.png", (data, size) => {
    fillRect(data, size, 4, 6, 24, 20, 92, 62, 32);
    fillRect(data, size, 7, 9, 18, 14, 120, 170, 210);
    fillRect(data, size, 16, 12, 6, 8, 80, 140, 70);
    fillRect(data, size, 9, 14, 5, 5, 240, 220, 90);
  });
  await makeIcon("challenge.png", (data, size) => {
    fillRect(data, size, 8, 8, 16, 16, 212, 175, 55);
    fillRect(data, size, 12, 6, 8, 4, 180, 40, 36);
    fillRect(data, size, 14, 12, 4, 8, 255, 240, 140);
  });

  console.log("Wrote steve variants and advancement icons.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
