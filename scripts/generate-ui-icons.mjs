/**
 * Pixel icons, movie posters, pack thumbnails, and a thunder rumble.
 * Run: node scripts/generate-ui-icons.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = join(root, "public", "textures", "icons");
mkdirSync(iconDir, { recursive: true });

const PAL = {
  ".": [0, 0, 0, 0],
  "#": [16, 16, 16, 255],
  W: [236, 236, 236, 255],
  G: [168, 168, 168, 255],
  D: [88, 88, 88, 255],
};

function sprite(rows, scale = 2) {
  const h = rows.length;
  const w = rows[0].length;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = PAL[rows[y][x]] ?? PAL["."];
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).resize(w * scale, h * scale, {
    kernel: "nearest",
  });
}

async function saveIcon(name, rows) {
  if (rows.some((row) => row.length !== 16) || rows.length !== 16) {
    throw new Error(`${name} must be 16x16, got ${rows.length}x${rows[0]?.length}`);
  }
  await sprite(rows, 3).png().toFile(join(iconDir, `${name}.png`));
}

const ICONS = {
  book: [
    "################",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WW######W#####W",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WW######W#####W",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWW#WWWWW#",
    "#WWWWWWWWWWWWWW#",
    "################",
    "................",
  ],
  books: [
    "################",
    "#WWW##WWW##WWW##",
    "#W#W##W#W##W#W##",
    "#WWW##WWW##WWW##",
    "#W#W##W#W##W#W##",
    "#WWW##WWW##WWW##",
    "#W#W##W#W##W#W##",
    "#WWW##WWW##WWW##",
    "################",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  check: [
    "................",
    "..............#.",
    ".............##.",
    "............#W#.",
    "...........#WW#.",
    "#.........#WW#..",
    "##.......#WW#...",
    "#W#.....#WW#....",
    "#WW#...#WW#.....",
    ".#WW#.#WW#......",
    "..#WW#WW#.......",
    "...#WWW#........",
    "....#W#.........",
    ".....#..........",
    "................",
    "................",
  ],
  piano: [
    "################",
    "#WWWWWWWWWWWWWW#",
    "#W#W#W#W#W#W#W##",
    "#W#W#W#W#W#W#W##",
    "#W#W#W#W#W#W#W##",
    "#W#W#W#W#W#W#W##",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "################",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  note: [
    "........########",
    "........#WWWWWW#",
    "........#WWWWWW#",
    "........#WWWW#.#",
    "........#WW#....",
    "........#WW#....",
    "........#WW#....",
    ".....###WWW#....",
    "....#WWWWWW#....",
    "...#WWWWWWW#....",
    "...#WWWWWW#.....",
    "....######......",
    "................",
    "................",
    "................",
    "................",
  ],
  movie: [
    "################",
    "#W#W#W#W#W#W#W##",
    "################",
    "#WWWWWWWWWWWWWW#",
    "#W############W#",
    "#W#WWWWWWWWWW#W#",
    "#W#W########W#W#",
    "#W#WWWWWWWWWW#W#",
    "#W#W########W#W#",
    "#W#WWWWWWWWWW#W#",
    "#W############W#",
    "#WWWWWWWWWWWWWW#",
    "################",
    "................",
    "................",
    "................",
  ],
  globe: [
    ".....######.....",
    "...##WWWWWW##...",
    "..#WWW#WW#WWW#..",
    ".#WWWW#WW#WWWW#.",
    ".#W##########W#.",
    "#WWWW#WWWW#WWWW#",
    "#WWWW#WWWW#WWWW#",
    ".#W##########W#.",
    ".#WWWW#WW#WWWW#.",
    "..#WWW#WW#WWW#..",
    "...##WWWWWW##...",
    ".....######.....",
    "................",
    "................",
    "................",
    "................",
  ],
  letter: [
    "################",
    "#WWWWWWWWWWWWWW#",
    "#W############W#",
    "#WW#WWWWWWWW#WW#",
    "#WWW#WWWWWW#WWW#",
    "#WWWW#WWWW#WWWW#",
    "#WWWWW#WW#WWWWW#",
    "#WWWWWW##WWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "#WWWWWWWWWWWWWW#",
    "################",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  redstone: [
    ".......##.......",
    "......#WW#......",
    "......#WW#......",
    "......#WW#......",
    "......#WW#......",
    ".....##WW##.....",
    "....#WWWWWW#....",
    "...#WWWWWWWW#...",
    "..#WWWWWWWWWW#..",
    "...#WWWWWWWW#...",
    "....#WWWWWW#....",
    ".....##WW##.....",
    "......####......",
    "................",
    "................",
    "................",
  ],
  map: [
    "################",
    "#WWWWWWWWWWWWWW#",
    "#W##WWWWWWWW##W#",
    "#WWWW#WWWWWWWWW#",
    "#WWWWWW##WWWWWW#",
    "#W##WWWWWWWWWWW#",
    "#WWWWWWW##WWWWW#",
    "#WWWWWWWWWW#WWW#",
    "#WWWWWWWWWWWWWW#",
    "################",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  pickaxe: [
    "......##########",
    ".....#WWWWWWWWW#",
    ".....#WWWWWWWWW#",
    "......####WW###.",
    ".........#W#....",
    "........#W#.....",
    ".......#W#......",
    "......#W#.......",
    ".....#W#........",
    "....#W#.........",
    "...#W#..........",
    "..#W#...........",
    ".#W#............",
    ".##.............",
    "................",
    "................",
  ],
  clock: [
    ".....######.....",
    "...##WWWWWW##...",
    "..#WWWWWWWWWW#..",
    ".#WWWW#WWWWWWW#.",
    ".#WWWW#WWWWWWW#.",
    "#WWWWW#WWWWWWWW#",
    "#WWWWW#####WWWW#",
    "#WWWWWWWWWWWWWW#",
    ".#WWWWWWWWWWWW#.",
    ".#WWWWWWWWWWWW#.",
    "..#WWWWWWWWWW#..",
    "...##WWWWWW##...",
    ".....######.....",
    "................",
    "................",
    "................",
  ],
};

async function makeMoviePoster(file, paint) {
  const w = 64;
  const h = 80;
  const data = Buffer.alloc(w * h * 4, 255);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = paint(x, y, w, h);
      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  const dir = join(root, "public", "activities", "movies");
  mkdirSync(dir, { recursive: true });
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(256, 320, { kernel: "nearest" })
    .png()
    .toFile(join(dir, file));
}

function edge(x, y, w, h) {
  return x < 2 || y < 2 || x >= w - 2 || y >= h - 2;
}

async function makePosters() {
  await makeMoviePoster("oppenheimer.png", (x, y, w, h) => {
    if (edge(x, y, w, h)) return [18, 14, 10];
    const cy = 28;
    const dx = x - 32;
    const dy = y - cy;
    const cloud = dx * dx + dy * dy * 0.55 < 180 && y < 48;
    const stem = Math.abs(x - 32) < 4 && y > 30 && y < 62;
    const desert = y > 58;
    if (cloud) return [210, 170, 90];
    if (stem) return [90, 70, 40];
    if (desert) return [120, 90, 45];
    return [28, 22, 18];
  });
  await makeMoviePoster("godfather.png", (x, y, w, h) => {
    if (edge(x, y, w, h)) return [8, 8, 8];
    const stripe = y > 18 && y < 26;
    const puppeteer = Math.abs(x - 32) < 8 && y > 28 && y < 52;
    if (stripe) return [180, 120, 40];
    if (puppeteer) return [30, 30, 30];
    return [12, 10, 10];
  });
  await makeMoviePoster("seven.png", (x, y, w, h) => {
    if (edge(x, y, w, h)) return [10, 10, 10];
    const rain = (x + y * 3) % 7 === 0;
    if (rain) return [90, 90, 90];
    if (y > 62) return [24, 24, 24];
    return [16, 16, 18];
  });
  await makeMoviePoster("interstellar.png", (x, y, w, h) => {
    if (edge(x, y, w, h)) return [4, 4, 8];
    const dx = x - 32;
    const dy = y - 38;
    const r2 = dx * dx + dy * dy;
    if (r2 < 36) return [6, 6, 8];
    if (r2 < 120) return [210, 170, 90];
    if (r2 < 160) return [80, 90, 140];
    const star = (x * 13 + y * 29) % 47 === 0;
    return star ? [220, 220, 230] : [8, 10, 22];
  });
}

async function makePackThumbs() {
  const packs = [
    ["vanilla", "panorama"],
    ["defrosted", "panorama-defrosted"],
    ["frosted", "panorama-frosted"],
    ["beach", "panorama-beach"],
    ["nether", "panorama-nether"],
    ["end", "panorama-end"],
  ];
  for (const [pack, folder] of packs) {
    const src = join(root, "public", folder, "0.png");
    const destDir = join(root, "public", "textures", "packs", pack);
    mkdirSync(destDir, { recursive: true });
    await sharp(src).resize(128, 96, { fit: "cover", position: "centre" }).png().toFile(join(destDir, "icon.png"));
  }
}

function writeWav(file, samples, sampleRate = 22050) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(file, buf);
}

function makeThunder() {
  const sr = 22050;
  const n = Math.floor(sr * 2.4);
  const samples = new Float32Array(n);
  let rumble = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const noise = Math.random() * 2 - 1;
    rumble = rumble * 0.97 + noise * 0.03;
    const crack = t < 0.09 ? (Math.random() * 2 - 1) * Math.exp(-t * 28) : 0;
    const body = rumble * Math.exp(-t * 1.6) * 1.4;
    const after = t > 0.18 && t < 0.32 ? (Math.random() * 2 - 1) * 0.35 * Math.exp(-(t - 0.18) * 12) : 0;
    samples[i] = crack * 0.95 + body * 0.85 + after;
  }
  writeWav(join(root, "public", "sounds", "thunder.wav"), samples);
}

for (const [name, rows] of Object.entries(ICONS)) {
  await saveIcon(name, rows);
}
await makePackThumbs();
makeThunder();
console.log("icons, pack thumbs, thunder written");
