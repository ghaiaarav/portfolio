/**
 * Biome cubemaps, pack icons, and tinted GUI buttons.
 * Run: node scripts/generate-packs.mjs
 */
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function noise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

const BIOMES = {
  defrosted: {
    sky: [255, 186, 214],
    skyTop: [255, 224, 238],
    horizon: [255, 168, 198],
    land: [118, 186, 96],
    dirt: [214, 140, 168],
    accent: [246, 120, 176],
    button: [196, 92, 138],
    buttonHover: [224, 128, 168],
  },
  frosted: {
    sky: [186, 220, 242],
    skyTop: [232, 244, 255],
    horizon: [210, 232, 245],
    land: [232, 244, 255],
    dirt: [176, 198, 214],
    accent: [140, 198, 230],
    button: [120, 158, 186],
    buttonHover: [160, 198, 224],
  },
  beach: {
    sky: [255, 214, 140],
    skyTop: [255, 232, 176],
    horizon: [255, 186, 92],
    land: [232, 198, 118],
    dirt: [214, 168, 78],
    accent: [70, 170, 196],
    button: [196, 148, 56],
    buttonHover: [224, 178, 78],
  },
  nether: {
    sky: [92, 18, 18],
    skyTop: [48, 8, 8],
    horizon: [140, 32, 24],
    land: [118, 42, 32],
    dirt: [72, 22, 18],
    accent: [214, 86, 32],
    button: [118, 36, 28],
    buttonHover: [158, 52, 36],
  },
  end: {
    sky: [18, 8, 28],
    skyTop: [8, 4, 16],
    horizon: [72, 32, 92],
    land: [196, 186, 128],
    dirt: [48, 28, 62],
    accent: [186, 92, 214],
    button: [72, 42, 96],
    buttonHover: [108, 64, 138],
  },
};

async function makeFace(pack, biome, index, size = 384) {
  const data = Buffer.alloc(size * size * 3);
  const isUp = index === 5;
  const isDown = index === 4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      const n = noise(x, y, index + pack.length) * 22 - 8;
      const t = y / size;

      if (isUp) {
        data[i] = clamp(biome.skyTop[0] + n);
        data[i + 1] = clamp(biome.skyTop[1] + n);
        data[i + 2] = clamp(biome.skyTop[2] + n);
        if (pack === "nether" && (x + y) % 37 < 3) {
          data[i] = clamp(biome.accent[0]);
          data[i + 1] = clamp(biome.accent[1]);
          data[i + 2] = clamp(biome.accent[2]);
        }
        continue;
      }
      if (isDown) {
        data[i] = clamp(biome.dirt[0] + n);
        data[i + 1] = clamp(biome.dirt[1] + n * 0.6);
        data[i + 2] = clamp(biome.dirt[2] + n * 0.4);
        continue;
      }

      const horizon = pack === "end" ? 0.62 : 0.44;
      if (t < horizon) {
        const mix = t / horizon;
        data[i] = clamp(biome.skyTop[0] * (1 - mix) + biome.horizon[0] * mix + n);
        data[i + 1] = clamp(biome.skyTop[1] * (1 - mix) + biome.horizon[1] * mix + n);
        data[i + 2] = clamp(biome.skyTop[2] * (1 - mix) + biome.horizon[2] * mix + n);
        if (pack === "defrosted" && noise(x * 0.08, y * 0.12, 9) > 0.82) {
          data[i] = 255;
          data[i + 1] = clamp(170 + n);
          data[i + 2] = clamp(200 + n);
        }
        if (pack === "end" && noise(x * 0.04, y * 0.04, 3) > 0.93) {
          data[i] = 220;
          data[i + 1] = 220;
          data[i + 2] = 255;
        }
      } else {
        const ground = (t - horizon) / (1 - horizon);
        if (pack === "beach" && ground < 0.22) {
          data[i] = clamp(biome.accent[0] + n);
          data[i + 1] = clamp(biome.accent[1] + n);
          data[i + 2] = clamp(biome.accent[2] + n);
        } else if (pack === "frosted" && ground < 0.18) {
          data[i] = clamp(160 + n);
          data[i + 1] = clamp(210 + n);
          data[i + 2] = clamp(230 + n);
        } else if (ground < 0.55) {
          data[i] = clamp(biome.land[0] + n);
          data[i + 1] = clamp(biome.land[1] + n);
          data[i + 2] = clamp(biome.land[2] + n);
          if (pack === "defrosted" && noise(x * 0.2, y * 0.2, index) > 0.7) {
            data[i] = clamp(biome.accent[0]);
            data[i + 1] = clamp(biome.accent[1]);
            data[i + 2] = clamp(biome.accent[2]);
          }
        } else {
          data[i] = clamp(biome.dirt[0] + n);
          data[i + 1] = clamp(biome.dirt[1] + n);
          data[i + 2] = clamp(biome.dirt[2] + n);
        }
      }
    }
  }
  const dir = join(root, "public", `panorama-${pack}`);
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: size, height: size, channels: 3 } })
    .png()
    .toFile(join(dir, `${index}.png`));
}

async function makeButton(pack, biome, hover = false) {
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  const base = hover ? biome.buttonHover : biome.button;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const edge = x < 2 || y < 2 || x > size - 3 || y > size - 3;
      const n = noise(x, y, biome.button[0]) * 18 - 8;
      const light = y < 3 ? 24 : 0;
      const dark = y > size - 4 ? -28 : 0;
      data[i] = clamp((edge ? base[0] * 0.45 : base[0]) + n + light + dark);
      data[i + 1] = clamp((edge ? base[1] * 0.45 : base[1]) + n + light + dark);
      data[i + 2] = clamp((edge ? base[2] * 0.45 : base[2]) + n + light + dark);
      data[i + 3] = 255;
    }
  }
  const dir = join(root, "public", "textures", "packs", pack);
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(dir, hover ? "button-hover.png" : "button.png"));
}

async function makeIcon(pack, biome) {
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x, y, 4) * 16 - 6;
      const sky = y < 28;
      const c = sky ? biome.sky : biome.land;
      data[i] = clamp(c[0] + n);
      data[i + 1] = clamp(c[1] + n);
      data[i + 2] = clamp(c[2] + n);
      data[i + 3] = 255;
      if (x > 18 && x < 46 && y > 20 && y < 52 && !sky) {
        data[i] = clamp(biome.accent[0]);
        data[i + 1] = clamp(biome.accent[1]);
        data[i + 2] = clamp(biome.accent[2]);
      }
    }
  }
  const dir = join(root, "public", "textures", "packs", pack);
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(dir, "icon.png"));
}

async function makeDirt(pack, biome) {
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x, y, 11) * 28 - 12;
      data[i] = clamp(biome.dirt[0] + n);
      data[i + 1] = clamp(biome.dirt[1] + n);
      data[i + 2] = clamp(biome.dirt[2] + n);
      data[i + 3] = 255;
    }
  }
  const dir = join(root, "public", "textures", "packs", pack);
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(dir, "dirt.png"));
}

async function makeVanillaIcon() {
  const dir = join(root, "public", "textures", "packs", "vanilla");
  mkdirSync(dir, { recursive: true });
  const size = 64;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x, y, 1) * 16;
      if (y < 28) {
        data[i] = clamp(135 + n);
        data[i + 1] = clamp(206 + n);
        data[i + 2] = clamp(235);
      } else {
        data[i] = clamp(70 + n);
        data[i + 1] = clamp(120 + n);
        data[i + 2] = clamp(55);
      }
      data[i + 3] = 255;
    }
  }
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(dir, "icon.png"));
}

async function makeItemIcon(name, paint) {
  const size = 32;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const [r, g, b, a = 255] = paint(x, y, size);
      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(b);
      data[i + 3] = a;
    }
  }
  const dir = join(root, "public", "textures", "items");
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(join(dir, `${name}.png`));
}

async function main() {
  await makeVanillaIcon();
  await makeDirt("vanilla", { dirt: [118, 84, 52] });
  for (const [pack, biome] of Object.entries(BIOMES)) {
    for (let i = 0; i < 6; i++) await makeFace(pack, biome, i);
    await makeButton(pack, biome, false);
    await makeButton(pack, biome, true);
    await makeIcon(pack, biome);
    await makeDirt(pack, biome);
    console.log(`pack ${pack}`);
  }

  await makeItemIcon("world", (x, y, size) => {
    if (y < size * 0.45) return [90, 170, 220, 255];
    if (y < size * 0.7) return [70, 140, 55, 255];
    return [110, 78, 42, 255];
  });
  await makeItemIcon("map", (x, y) => {
    const edge = x < 3 || y < 3 || x > 28 || y > 28;
    return edge ? [40, 28, 16, 255] : [214, 196, 128, 255];
  });
  await makeItemIcon("chest", (x, y) => {
    if (y > 12 && y < 16) return [40, 24, 12, 255];
    if (x > 13 && x < 19 && y > 10 && y < 18) return [90, 90, 90, 255];
    return [160, 102, 32, 255];
  });
  await makeItemIcon("book", (x, y) => {
    if (x < 6) return [90, 40, 24, 255];
    return [230, 220, 180, 255];
  });
  await makeItemIcon("compass", (x, y, size) => {
    const dx = x - 15.5;
    const dy = y - 15.5;
    const r = Math.hypot(dx, dy);
    if (r > 14) return [0, 0, 0, 0];
    if (r > 12) return [60, 60, 60, 255];
    if (dy < 0 && Math.abs(dx) < 2) return [200, 40, 40, 255];
    return [200, 200, 200, 255];
  });
  await makeItemIcon("torch", (x, y) => {
    if (y < 10 && x > 12 && x < 20) return [255, 220, 70, 255];
    if (x > 13 && x < 19) return [150, 90, 32, 255];
    return [0, 0, 0, 0];
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
