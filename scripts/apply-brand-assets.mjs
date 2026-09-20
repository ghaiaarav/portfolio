/**
 * Copy attached brand logos, Minecraft paper + pack arrows,
 * a mill icon, and pixelated movie stills.
 */
import { mkdirSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(
  process.env.USERPROFILE ?? "",
  ".cursor/projects/c-Users-aarav-Projects-aaravghai-portfolio/assets"
);

function rawPng(pixels, w, h, scale, dest) {
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < pixels.length; i++) {
    const [r, g, b, a = 255] = pixels[i];
    const o = i * 4;
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = a;
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(w * scale, h * scale, { kernel: "nearest" })
    .png()
    .toFile(dest);
}

function paint(rows, pal, scale, dest) {
  const h = rows.length;
  const w = rows[0].length;
  const pixels = [];
  for (const row of rows) {
    for (const ch of row) {
      pixels.push(pal[ch] ?? [0, 0, 0, 0]);
    }
  }
  return rawPng(pixels, w, h, scale, dest);
}

async function makePackArrows() {
  const destDir = join(root, "public", "textures", "vanilla");
  mkdirSync(destDir, { recursive: true });
  const pal = {
    ".": [0, 0, 0, 0],
    o: [18, 48, 96, 255],
    d: [38, 112, 186, 255],
    m: [72, 186, 236, 255],
    l: [150, 228, 255, 255],
    h: [236, 250, 255, 255],
  };
  const right = [
    "................",
    "........oh......",
    ".......omlh.....",
    "......ommlh.....",
    ".....ommmlh.....",
    "....ommmmlh.....",
    "oooommmmmlh.....",
    "ooooommmmmlh....",
    "oooommmmmlh.....",
    "....ommmmdh.....",
    ".....ommmdh.....",
    "......ommdh.....",
    ".......omdh.....",
    "........oh......",
    "................",
    "................",
  ];
  const left = right.map((row) => [...row].reverse().join(""));
  await paint(right, pal, 2, join(destDir, "pack-arrow-right.png"));
  await paint(left, pal, 2, join(destDir, "pack-arrow-left.png"));
}

async function makePaper() {
  const dest = join(root, "public", "textures", "icons", "paper.png");
  const pal = {
    ".": [0, 0, 0, 0],
    o: [92, 74, 42, 255],
    d: [186, 168, 120, 255],
    m: [232, 220, 176, 255],
    l: [248, 242, 214, 255],
    h: [255, 252, 240, 255],
  };
  const rows = [
    "................",
    "....ooooooo.....",
    "...ohhhhhhdo....",
    "..ohhhhhhddo....",
    ".olhhhhhdddo....",
    ".olmmmhddddo....",
    ".olmmmddddo.....",
    ".olmmddddo......",
    ".olmddddo.......",
    ".olddddo........",
    "..odddo.........",
    "...odo..........",
    "....o...........",
    "................",
    "................",
    "................",
  ];
  await paint(rows, pal, 3, dest);
}

async function makeMill() {
  const dest = join(root, "public", "logos", "mill.png");
  mkdirSync(dirname(dest), { recursive: true });
  const pal = {
    ".": [0, 0, 0, 0],
    k: [18, 18, 20, 255],
    d: [52, 54, 60, 255],
    m: [92, 96, 104, 255],
    l: [156, 160, 168, 255],
    h: [214, 216, 220, 255],
    y: [212, 160, 28, 255],
    r: [188, 48, 40, 255],
    n: [36, 70, 120, 255],
    t: [72, 48, 32, 255],
  };
  const rows = [
    "................................",
    "......kkkkkkkkkk................",
    "......kllllllllk..kkkk..........",
    "......klhhhhhhlk..kllk..........",
    "......klhmmmmhlkkkkllk..........",
    "......klhmmmmhlklllllk..........",
    "......klhmmmrrlk.kllk...........",
    "......klhmmmmmlk.kyyk...........",
    "......kllllllllk.kllk...........",
    "......kkkkkkkkkk..kk............",
    "......kdmmmmmdk.................",
    "......kdmmmmmdk.................",
    "......kdmmnmmdk.................",
    "......kdmmnmmdk.................",
    "......kdmmnmmdk.................",
    "......kdmnnnmdk.................",
    "......kdmmnmmdk.................",
    "......kdmmnmmdk.................",
    ".kkkkkkdmmnmmdkkkkkkkkkkkkkkkk..",
    ".klllllllllllllllllllllllllllk..",
    ".klhhhhhhhhhhhhhhhhhhhhhhhhhlk..",
    ".klhmmmmmmmmmmmmmmmmmmmmmmmhlk..",
    ".klhmmkmmkmmkmmkmmkmmkmmkmmhlk..",
    ".klhmmmmmmmmmmmmmmmmmmmmmmmhlk..",
    ".klllllllllllllllllllllllllllk..",
    ".kkkkkkkkkkkkkkkkkkkkkkkkkkkkk..",
    ".....kttk..............kttk.....",
    ".....kttk..............kttk.....",
    "...kkkkkkkk..........kkkkkkkk...",
    "...kddddddk..........kddddddk...",
    "...kkkkkkkk..........kkkkkkkk...",
    "................................",
  ];
  await paint(rows, pal, 4, dest);
}

async function squareLogo(src, dest, { bg, knockoutWhite } = {}) {
  const image = sharp(src);
  const meta = await image.metadata();
  const size = 128;
  let pipeline = sharp(src);
  if (knockoutWhite) {
    const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 248 && data[i + 1] > 248 && data[i + 2] > 248) data[i + 3] = 0;
    }
    pipeline = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  }
  const fitted = await pipeline
    .resize(size, size, { fit: "contain", background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(fitted).png().toFile(dest);
  return meta;
}

async function copyLogos() {
  const destDir = join(root, "public", "logos");
  const iconDir = join(root, "public", "textures", "icons");
  mkdirSync(destDir, { recursive: true });
  mkdirSync(iconDir, { recursive: true });

  const names = readdirSync(assets);
  const find = (id) => {
    const name = names.find((entry) => entry.includes(id));
    if (!name) throw new Error(`missing asset ${id}`);
    return `\\\\?\\${join(assets, name)}`;
  };

  await squareLogo(find("bdd26584"), join(iconDir, "linkedin.png"));
  await squareLogo(find("b63b9015"), join(iconDir, "github.png"));
  await squareLogo(find("2cebaecf"), join(iconDir, "phone.png"));
  await squareLogo(find("6119dbf4"), join(destDir, "devpost.png"));
  await squareLogo(find("4f4aef24"), join(destDir, "wordpress.png"));
  await squareLogo(find("cce568ee"), join(destDir, "f1.png"), { bg: { r: 17, g: 18, b: 24, alpha: 255 } });
  await squareLogo(find("97946857"), join(destDir, "torus.png"), { knockoutWhite: true });
  await squareLogo(find("216e353e"), join(destDir, "solar.png"));
  await squareLogo(find("c7904faa"), join(destDir, "acm.png"));
}

async function fetchBuffer(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  };
  if (url.includes("wikimedia") || url.includes("wikipedia")) {
    headers.Referer = "https://en.wikipedia.org/";
  }
  const res = await fetch(url, { headers, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const type = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 80) throw new Error(`tiny body ${url}`);
  const looksLikeHtml = buf.subarray(0, 32).toString("utf8").toLowerCase().includes("<html");
  if (looksLikeHtml || type.includes("text/html")) {
    throw new Error(`not an image: ${type || "unknown"} ${url}`);
  }
  return buf;
}

async function pixelatePoster(buf, dest) {
  const small = await sharp(buf)
    .resize(48, 64, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();
  await sharp(small).resize(192, 256, { kernel: "nearest" }).png().toFile(dest);
}

async function makeMoviePosters() {
  const destDir = join(root, "public", "activities", "movies");
  mkdirSync(destDir, { recursive: true });
  const sources = {
    "oppenheimer.png": [
      "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
      join(root, "public", "activities", "movies", "oppenheimer.jpg"),
    ],
    "godfather.png": [
      "https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
    ],
    "seven.png": [
      "https://image.tmdb.org/t/p/w342/6yoghtyTpznpBik8EngEmJskVUO.jpg",
      "https://upload.wikimedia.org/wikipedia/en/6/68/Seven_%28movie%29_poster.jpg",
    ],
    "interstellar.png": [
      "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
    ],
  };

  for (const [file, urls] of Object.entries(sources)) {
    let buf = null;
    let used = "";
    for (const url of urls) {
      try {
        if (url.endsWith(".jpg") && !url.startsWith("http")) {
          buf = readFileSync(url);
          used = url;
          break;
        }
        buf = await fetchBuffer(url);
        used = url;
        break;
      } catch (err) {
        console.warn(`skip ${url}: ${err.message}`);
      }
    }
    if (!buf) {
      console.warn(`no source for ${file}`);
      continue;
    }
    await pixelatePoster(buf, join(destDir, file));
    console.log(`pixelated ${file} from ${used}`);
  }
}

await makePackArrows();
await makePaper();
await makeMill();
await copyLogos();
await makeMoviePosters();
console.log("brand assets written");
