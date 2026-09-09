/**
 * Generates MC-style panorama faces and GUI textures as PNG files.
 * Run: node scripts/generate-assets.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const panoramaDir = join(root, "public", "panorama");
const texturesDir = join(root, "public", "textures");

mkdirSync(panoramaDir, { recursive: true });
mkdirSync(texturesDir, { recursive: true });

function noise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

async function makePanoramaFace(index, width = 512, height = 512) {
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const horizon = height * 0.42;
      const n = noise(x, y, index) * 18;

      if (y < horizon) {
        // sky with slight variation per face
        const skyBase = 135 + index * 3;
        data[i] = skyBase + n * 0.5;
        data[i + 1] = 206 + n * 0.3;
        data[i + 2] = 235 + n * 0.2;
      } else {
        const t = (y - horizon) / (height - horizon);
        if (t < 0.15) {
          // water band
          data[i] = 30 + n;
          data[i + 1] = 80 + index * 2 + n;
          data[i + 2] = 120 + n;
        } else if (t < 0.55) {
          // green hills
          data[i] = 45 + n * 0.5;
          data[i + 1] = 100 + index * 3 + n;
          data[i + 2] = 55 + n * 0.5;
        } else {
          // brown cliffs / dirt
          data[i] = 80 + index * 2 + n;
          data[i + 1] = 60 + n;
          data[i + 2] = 40 + n * 0.5;
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(join(panoramaDir, `${index}.png`));
}

async function makeButtonTexture(name, baseR, baseG, baseB) {
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x, y, baseR) * 28 - 14;
      data[i] = Math.min(255, Math.max(0, baseR + n));
      data[i + 1] = Math.min(255, Math.max(0, baseG + n));
      data[i + 2] = Math.min(255, Math.max(0, baseB + n));
      data[i + 3] = 255;
    }
  }
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(texturesDir, name));
}

async function makeLangIcon() {
  const size = 32;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;

      // speech bubble body
      const inBubble =
        x >= 4 && x <= 26 && y >= 4 && y <= 20 && !(x >= 22 && y >= 16 && x + y > 38);
      const inGlobe = (x - 22) ** 2 + (y - 10) ** 2 <= 36 && y >= 6;

      if (inBubble || inGlobe) {
        data[i] = 200;
        data[i + 1] = 200;
        data[i + 2] = 200;
        data[i + 3] = 255;
      }
      // globe lines
      if (inGlobe && (Math.abs(x - 22) <= 1 || Math.abs(y - 10) <= 1)) {
        data[i] = 100;
        data[i + 1] = 100;
        data[i + 2] = 100;
      }
    }
  }
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(texturesDir, "lang.png"));
}

async function makeStoneTexture() {
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x, y, 99) * 40 - 20;
      data[i] = 86 + n;
      data[i + 1] = 86 + n;
      data[i + 2] = 86 + n;
      data[i + 3] = 255;
    }
  }
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(texturesDir, "stone.png"));
}

async function main() {
  for (let i = 0; i < 6; i++) {
    await makePanoramaFace(i);
    console.log(`panorama/${i}.png`);
  }
  await makeButtonTexture("button.png", 124, 124, 124);
  await makeButtonTexture("button-hover.png", 160, 160, 160);
  await makeLangIcon();
  await makeStoneTexture();
  console.log("Done.");
}

main().catch(console.error);
