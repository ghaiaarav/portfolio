/**
 * Draws the Minecraft-style pixel art for World/Server logos, resource-pack
 * paintings, and the Server media stills.
 *
 * Every image is drawn on a small grid (16-80px) and upscaled with
 * nearest-neighbour so each art pixel stays a crisp square block.
 * Run: node scripts/generate-pixel-art.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (...parts) => join(root, "public", ...parts);

/* ------------------------------------------------------------------ */
/* Canvas + drawing primitives                                         */
/* ------------------------------------------------------------------ */

const K = [18, 18, 20]; // item outline, matches public/logos/mill.png

class Canvas {
  constructor(w, h, fill = null) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(fill);
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  get(x, y) {
    return this.inside(x, y) ? this.px[y * this.w + x] : null;
  }

  set(x, y, c) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.inside(x, y)) this.px[y * this.w + x] = c;
  }

  /** Paint every pixel where `pick(x, y)` returns a colour. */
  fill(pick) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = pick(x, y, this.get(x, y));
        if (c !== undefined) this.set(x, y, c);
      }
    }
  }

  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        this.set(i, j, typeof c === "function" ? c(i, j, this.get(i, j)) : c);
      }
    }
  }

  disc(cx, cy, r, c) {
    this.fill((x, y, cur) => {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r) return typeof c === "function" ? c(x, y, dx / r, dy / r, cur) : c;
    });
  }

  poly(points, c) {
    this.fill((x, y, cur) => {
      if (insidePoly(points, x + 0.5, y + 0.5)) return typeof c === "function" ? c(x, y, cur) : c;
    });
  }

  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  /** Stamp a hand-drawn sprite; `.` (or any char missing from pal) is skipped. */
  stamp(rows, pal, ox, oy) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (pal[ch]) this.set(ox + i, oy + j, pal[ch]);
      });
    });
  }

  draw(layer, ox = 0, oy = 0) {
    for (let y = 0; y < layer.h; y++) {
      for (let x = 0; x < layer.w; x++) {
        const c = layer.get(x, y);
        if (c) this.set(ox + x, oy + y, c);
      }
    }
  }

  /**
   * Wrap every opaque shape in a 1px outline. 4-neighbour by default, like
   * vanilla items; `corners` also fills diagonals for a solid logo rim.
   */
  outline(color = K, { corners = false } = {}) {
    const src = this.px.slice();
    const at = (x, y) => (this.inside(x, y) ? src[y * this.w + x] : null);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (at(x, y)) continue;
        const edge = at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1);
        const diag = corners && (at(x - 1, y - 1) || at(x + 1, y - 1) || at(x - 1, y + 1) || at(x + 1, y + 1));
        if (edge || diag) this.set(x, y, color);
      }
    }
    return this;
  }
}

function insidePoly(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* ------------------------------------------------------------------ */
/* Colour + texture helpers                                            */
/* ------------------------------------------------------------------ */

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const mix = (a, b, t) => [0, 1, 2].map((i) => clamp(a[i] + (b[i] - a[i]) * t));
const shade = (c, f) => c.map((v) => clamp(v * f));

/** Deterministic per-pixel noise in [0, 1). */
function hash(x, y, seed = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const pick = (pal, x, y, seed = 0) => pal[Math.floor(hash(x, y, seed) * pal.length)];

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const bayer = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;

/** Ordered-dither between colour stops, like a banded Minecraft sky. */
function ditherStops(stops, t, x, y) {
  const span = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = Math.floor(span);
  return span - i > bayer(x, y) ? stops[Math.min(i + 1, stops.length - 1)] : stops[i];
}

function skyGradient(c, stops, y0 = 0, h = c.h) {
  c.fill((x, y) => {
    if (y < y0 || y >= y0 + h) return undefined;
    return ditherStops(stops, (y - y0) / Math.max(1, h - 1), x, y);
  });
}

function stars(c, { density, seed, colors, until = c.h }) {
  c.fill((x, y) => {
    if (y >= until) return undefined;
    if (hash(x, y, seed) < density) return pick(colors, x, y, seed + 1);
  });
}

function sparkle(c, x, y, size, core, glow) {
  for (let k = 1; k <= size; k++) {
    c.set(x - k, y, glow);
    c.set(x + k, y, glow);
    c.set(x, y - k, glow);
    c.set(x, y + k, glow);
  }
  c.set(x, y, core);
}

/** Brighten / tint everything inside a radius, fading out (cheap light source). */
function glow(c, cx, cy, radius, tint, strength) {
  c.fill((x, y, cur) => {
    if (!cur) return undefined;
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius;
    if (d >= 1) return undefined;
    const t = (1 - d) * strength;
    return t > bayer(x, y) * 0.25 ? mix(cur, tint, t) : cur;
  });
}

function vignette(c, cx, cy, radius, floor = 0.35) {
  c.fill((x, y, cur) => {
    if (!cur) return undefined;
    const d = Math.min(1, Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius);
    return shade(cur, 1 - (1 - floor) * d * d);
  });
}

const OAK = { seam: [92, 66, 38], pal: [[168, 132, 82], [160, 124, 76], [176, 140, 88]] };
const SPRUCE = { seam: [58, 38, 22], pal: [[104, 74, 44], [96, 68, 40], [112, 80, 48]] };
const DARK_OAK = { seam: [32, 20, 10], pal: [[66, 44, 24], [60, 40, 22], [72, 48, 26]] };
const BIRCH = { seam: [170, 156, 112], pal: [[214, 202, 150], [206, 194, 142], [220, 208, 158]] };

/** Horizontal planks: 4px rows with staggered vertical seams. */
const planks = (wood, seed = 0) => (x, y) => {
  const row = Math.floor(y / 4);
  if (y % 4 === 3) return wood.seam;
  if ((x + row * 7) % 16 === 0) return wood.seam;
  return pick(wood.pal, x, y, seed);
};

const STONE_BRICK = { mortar: [34, 34, 40], pal: [[60, 60, 68], [54, 54, 62], [66, 66, 74]] };

const bricks = (style, seed = 0, bw = 8, bh = 4) => (x, y) => {
  const row = Math.floor(y / bh);
  const off = row % 2 ? bw / 2 : 0;
  if (y % bh === bh - 1 || (x + off) % bw === bw - 1) return style.mortar;
  return pick(style.pal, x, y, seed);
};

const GRASS = [[92, 160, 60], [104, 172, 68], [84, 148, 54]];
const DIRT = [[134, 96, 66], [120, 84, 56], [146, 106, 74], [110, 76, 50]];

/** Grass-block strip: green top, jagged drip, dirt below. */
function grassGround(c, top, seed = 3, tint = 1) {
  c.fill((x, y) => {
    if (y < top) return undefined;
    const drip = top + 2 + (hash(x, 0, seed) < 0.45 ? 1 : 0);
    const col = y < drip ? pick(GRASS, x, y, seed) : pick(DIRT, x, y, seed + 1);
    return tint === 1 ? col : shade(col, tint);
  });
}

const LEAVES = [[48, 112, 40], [60, 132, 48], [40, 96, 34], [72, 148, 56], [28, 70, 26]];

function leafBlob(c, x, y, w, h, seed = 9) {
  c.rect(x, y, w, h, (i, j) => {
    const edge = i === x || i === x + w - 1 || j === y || j === y + h - 1;
    if (edge && hash(i, j, seed) < 0.35) return undefined;
    return pick(LEAVES, i, j, seed);
  });
}

/* ------------------------------------------------------------------ */
/* Tiny bitmap glyphs                                                  */
/* ------------------------------------------------------------------ */

const FONT = {
  A: [".#.", "#.#", "###", "#.#", "#.#"],
  B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"],
  D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"],
  F: ["###", "#..", "##.", "#..", "#.."],
  G: [".##", "#..", "#.#", "#.#", ".##"],
  H: ["#.#", "#.#", "###", "#.#", "#.#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  L: ["#..", "#..", "#..", "#..", "###"],
  M: ["#.#", "###", "###", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"],
  O: [".#.", "#.#", "#.#", "#.#", ".#."],
  P: ["##.", "#.#", "##.", "#..", "#.."],
  R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."],
  T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"],
  V: ["#.#", "#.#", "#.#", "#.#", ".#."],
  Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
  Z: ["###", "..#", ".#.", "#..", "###"],
  "?": ["##.", "..#", ".#.", "...", ".#."],
  "-": ["...", "...", "###", "...", "..."],
  "+": ["...", ".#.", "###", ".#.", "..."],
  "=": ["...", "###", "...", "###", "..."],
  0: ["###", "#.#", "#.#", "#.#", "###"],
  ">": ["#..", ".#.", "..#", ".#.", "#.."],
  _: ["...", "...", "...", "...", "###"],
  χ: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  " ": ["...", "...", "...", "...", "..."],
};

const textWidth = (str) => str.length * 4 - 1;

/** Centre a line of text in the canvas, with a Minecraft-style drop shadow. */
function centeredText(c, str, y, color, shadowColor) {
  text(c, str, Math.round((c.w - textWidth(str)) / 2), y, color, shadowColor);
}

function text(c, str, x, y, color, shadowColor) {
  [...str].forEach((ch, n) => {
    const glyph = FONT[ch];
    if (!glyph) return;
    if (shadowColor) c.stamp(glyph, { "#": shadowColor }, x + n * 4 + 1, y + 1);
    c.stamp(glyph, { "#": color }, x + n * 4, y);
  });
}

const MATH_GLYPHS = {
  sigma: ["#####", "#....", ".#...", "..#..", ".#...", "#....", "#####"],
  pi: ["#####", ".#.#.", ".#.#.", ".#.#.", ".#..#"],
  integral: ["..##", ".#..", ".#..", ".#..", ".#..", ".#..", "##.."],
  infinity: [".##.##.", "#..#..#", ".##.##."],
  root: ["...###", "...#..", "#..#..", ".#.#..", "..#..."],
  nabla: ["#####", "#...#", ".#.#.", ".#.#.", "..#.."],
};

const NOTE = ["..#..", "..##.", "..#.#", "..#..", ".##..", "###..", ".#..."];

/* ------------------------------------------------------------------ */
/* Shape helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Flat-ended tube between two points. `colorAt(t, side)` gets the position
 * along the tube (0..1) and the signed side (-1 bottom-right .. 1 top-left).
 */
function tube(c, [x0, y0], [x1, y1], radiusAt, colorAt) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  const len = Math.sqrt(len2);
  c.fill((x, y) => {
    const px = x + 0.5 - x0;
    const py = y + 0.5 - y0;
    const t = (px * dx + py * dy) / len2;
    if (t < 0 || t > 1) return undefined;
    const r = radiusAt(t);
    const side = (px * dy - py * dx) / len;
    if (Math.abs(side) <= r) return colorAt(t, side / r);
  });
}

/**
 * Inventory-style isometric block. Each face callback gets (u, v) in [0, 1)
 * and returns a colour; faces are lit top > left > right like vanilla GUI items.
 */
function isoCube(c, cx, y0, s, faces) {
  const faceDefs = [
    { fn: faces.top, light: 1, o: [cx, y0], a: [s, s / 2], b: [-s, s / 2] },
    { fn: faces.left, light: 0.8, o: [cx - s, y0 + s / 2], a: [s, s / 2], b: [0, s] },
    { fn: faces.right, light: 0.62, o: [cx, y0 + s], a: [s, -s / 2], b: [0, s] },
  ];
  c.fill((x, y) => {
    for (const f of faceDefs) {
      const dx = x + 0.5 - f.o[0];
      const dy = y + 0.5 - f.o[1];
      const det = f.a[0] * f.b[1] - f.b[0] * f.a[1];
      const u = (dx * f.b[1] - f.b[0] * dy) / det;
      const v = (f.a[0] * dy - dx * f.a[1]) / det;
      if (u >= 0 && u < 1 && v >= 0 && v < 1) return shade(f.fn(u, v), f.light);
    }
    return undefined;
  });
}

/**
 * Sphere-traced torus with banded (palette-quantised) lighting and an
 * optional graph drawn on its surface along the u/v grid.
 */
function torus(c, opts) {
  const { cx, cy, R, r, tilt, ramp, uSeg = 0, vSeg = 0, lineW = 0.07, lineShade = 0.72, vertex, ambient = 0.18 } = opts;
  // loops: [{ axis: "u" | "v", at: 0..1, width, color }] paint single closed curves.
  const loops = opts.loops ?? [];
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const local = (x, y, z) => [x, y * cos - z * sin, y * sin + z * cos];
  const sdf = (x, y, z) => {
    const [lx, ly, lz] = local(x, y, z);
    const q = Math.hypot(lx, lz) - R;
    return Math.hypot(q, ly) - r;
  };
  const L = (() => {
    const v = [-0.55, -0.75, -0.65];
    const n = Math.hypot(...v);
    return v.map((k) => k / n);
  })();

  c.fill((x, y, cur) => {
    const px = x + 0.5 - cx;
    const py = y + 0.5 - cy;
    let z = -R - r - 2;
    let hit = false;
    for (let i = 0; i < 160 && z < R + r + 2; i++) {
      const d = sdf(px, py, z);
      if (d < 0.005) {
        hit = true;
        break;
      }
      z += Math.max(d, 0.01);
    }
    if (!hit) return undefined;
    const e = 0.01;
    const n = [
      sdf(px + e, py, z) - sdf(px - e, py, z),
      sdf(px, py + e, z) - sdf(px, py - e, z),
      sdf(px, py, z + e) - sdf(px, py, z - e),
    ];
    const nl = Math.hypot(...n);
    const lambert = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nl);
    const level = Math.min(ramp.length - 1, Math.floor((ambient + (1 - ambient) * lambert) * ramp.length));
    let col = ramp[level];

    if (uSeg || vSeg || loops.length) {
      const [lx, ly, lz] = local(px, py, z);
      const u = (Math.atan2(lz, lx) / (2 * Math.PI) + 1) % 1;
      const v = (Math.atan2(ly, Math.hypot(lx, lz) - R) / (2 * Math.PI) + 1) % 1;
      const near = (t, seg) => {
        if (!seg) return false;
        const f = (t * seg) % 1;
        return f < lineW || f > 1 - lineW;
      };
      const onU = near(u, uSeg);
      const onV = near(v, vSeg);
      if (onU && onV && vertex) col = vertex;
      else if (onU || onV) col = shade(col, lineShade);
      for (const loop of loops) {
        const t = loop.axis === "u" ? u : v;
        const d = Math.abs(((t - loop.at + 1.5) % 1) - 0.5);
        if (d < loop.width) col = lambert > 0.35 ? loop.color : shade(loop.color, 0.7);
      }
    }
    return col;
  });
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

/**
 * Upscale with nearest-neighbour, then centre-crop to the exact target size
 * (some existing slots are not an integer multiple of the art grid).
 */
async function save(canvas, scale, dest, size) {
  const data = Buffer.alloc(canvas.w * canvas.h * 4);
  canvas.px.forEach((c, i) => {
    if (!c) return;
    data[i * 4] = c[0];
    data[i * 4 + 1] = c[1];
    data[i * 4 + 2] = c[2];
    data[i * 4 + 3] = c[3] ?? 255;
  });
  const bigW = canvas.w * scale;
  const bigH = canvas.h * scale;
  let img = sharp(data, { raw: { width: canvas.w, height: canvas.h, channels: 4 } }).resize(bigW, bigH, {
    kernel: "nearest",
  });
  if (size && (size.width !== bigW || size.height !== bigH)) {
    const upscaled = await img.png().toBuffer();
    img = sharp(upscaled).extract({
      left: Math.floor((bigW - size.width) / 2),
      top: Math.floor((bigH - size.height) / 2),
      width: size.width,
      height: size.height,
    });
  }
  // Lossless PNG keeps pixel edges sharp.
  const out = await img.png({ compressionLevel: 9, palette: false }).toBuffer();
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, out);
  console.log(`wrote ${dest.slice(root.length + 1)} (${size?.width ?? bigW}x${size?.height ?? bigH})`);
}

/** Pick a grid that covers `width x height` at `scale`, cropped on save. */
const gridFor = (width, height, scale) => [Math.ceil(width / scale), Math.ceil(height / scale)];

/* ------------------------------------------------------------------ */
/* Logos (32x32 items -> 128x128)                                      */
/* ------------------------------------------------------------------ */

const ICON = 32;
const ICON_SCALE = 4;

/** SCRUGS: a torus with a graph embedded on its surface. */
function iconTorus() {
  const c = new Canvas(ICON, ICON);
  torus(c, {
    cx: 16,
    cy: 16.5,
    R: 9.2,
    r: 4.7,
    tilt: 1.02,
    ramp: [
      [58, 28, 96],
      [92, 50, 146],
      [128, 82, 194],
      [170, 126, 232],
      [214, 184, 252],
    ],
    uSeg: 8,
    vSeg: 4,
    lineW: 0.09,
    lineShade: 0.66,
    vertex: [255, 214, 92],
  });
  return c.outline();
}

/** Galaxies lab: a copper spyglass under the stars. */
function iconSpyglass() {
  const c = new Canvas(ICON, ICON);
  const copper = { hi: [250, 192, 150], light: [226, 138, 92], mid: [186, 96, 60], dark: [118, 56, 32] };
  const glass = { hi: [226, 250, 255], mid: [140, 214, 238], dark: [70, 140, 176] };
  tube(
    c,
    [6.5, 25.5],
    [25, 7],
    (t) => (t < 0.22 ? 1.7 : t > 0.82 ? 3.1 : 2.5),
    (t, side) => {
      if (t > 0.93) return side > 0.35 ? glass.hi : side > -0.4 ? glass.mid : glass.dark;
      const ring = (t > 0.2 && t < 0.27) || (t > 0.78 && t < 0.84);
      const tone = side > 0.55 ? "hi" : side > 0 ? "light" : side > -0.55 ? "mid" : "dark";
      const col = copper[tone];
      return ring ? shade(col, 0.7) : col;
    }
  );
  sparkle(c, 8, 8, 2, [255, 255, 240], [255, 222, 110]);
  sparkle(c, 25, 21, 1, [255, 255, 255], [170, 210, 255]);
  c.set(15, 4, [255, 240, 200]);
  return c.outline();
}

/** SEP Lab / ACM: a blue book with a diamond gem emblem and a ribbon. */
function iconBook() {
  const c = new Canvas(ICON, ICON);
  const blue = { light: [76, 140, 218], mid: [44, 96, 176], dark: [26, 56, 116], deep: [16, 36, 80] };
  const gold = [232, 182, 52];
  const goldDark = [176, 124, 30];

  c.rect(9, 5, 18, 24, blue.deep); // back cover
  c.rect(9, 5, 17, 23, (x, y) => (y % 2 ? [214, 202, 166] : [240, 232, 206])); // page stack
  c.rect(7, 3, 17, 24, (x, y) => {
    if (x <= 9) return y === 6 || y === 23 ? gold : x === 7 ? blue.mid : blue.dark; // spine
    if (y === 3) return blue.light;
    if (x === 23 || y === 26) return blue.dark;
    if (x === 10) return blue.light;
    return blue.mid;
  });

  // Diamond gem emblem.
  const ex = 17;
  const ey = 14.5;
  c.fill((x, y) => {
    const dx = x + 0.5 - ex;
    const dy = y + 0.5 - ey;
    const d = Math.abs(dx) + Math.abs(dy);
    if (d > 6.2) return undefined;
    if (d > 5) return dx + dy < 0 ? gold : goldDark;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return [255, 255, 255];
    return dx + dy < 0 ? [150, 236, 248] : dx - dy > 1 ? [56, 168, 206] : [96, 206, 232];
  });

  c.rect(20, 27, 2, 3, [196, 44, 44]); // ribbon
  c.set(20, 29, [150, 28, 28]);
  return c.outline();
}

/** LowLa (voice assistant): a speaker-grille note block with floating notes. */
function iconNoteBlock() {
  const c = new Canvas(ICON, ICON);
  const wood = { dark: [78, 46, 26], mid: [126, 78, 46], light: [152, 98, 60], grille: [40, 24, 14] };
  const N = 11;
  const tex = (u, v, face) => {
    const tx = Math.floor(u * N);
    const ty = Math.floor(v * N);
    if (tx === 0 || ty === 0 || tx === N - 1 || ty === N - 1) return wood.dark;
    if (face === "side") {
      const d = Math.hypot(tx - (N - 1) / 2, ty - (N - 1) / 2);
      if (d < 3.4 && (tx + ty) % 2 === 0) return wood.grille;
    } else if (ty % 3 === 0) {
      return shade(wood.mid, 0.85);
    }
    return hash(tx, ty, face === "side" ? 4 : 5) < 0.3 ? wood.light : wood.mid;
  };
  isoCube(c, 13, 8, 11, {
    top: (u, v) => tex(u, v, "top"),
    left: (u, v) => tex(u, v, "side"),
    right: (u, v) => tex(u, v, "side"),
  });
  c.stamp(NOTE, { "#": [96, 226, 104] }, 25, 6);
  c.stamp(NOTE, { "#": [236, 104, 210] }, 18, 0);
  return c.outline();
}

/** RIOT (classroom observation): an observer-style block that watches. */
function iconObserver() {
  const c = new Canvas(ICON, ICON);
  const stone = { dark: [86, 86, 92], mid: [120, 120, 126], light: [148, 148, 154], edge: [64, 64, 70] };
  const N = 13;
  const base = (tx, ty, seed) => {
    if (tx === 0 || ty === 0 || tx === N - 1 || ty === N - 1) return stone.edge;
    const n = hash(tx, ty, seed);
    return n < 0.22 ? stone.dark : n > 0.8 ? stone.light : stone.mid;
  };
  isoCube(c, 16, 2, 13, {
    top: (u, v) => {
      const tx = Math.floor(u * N);
      const ty = Math.floor(v * N);
      // Arrow pointing away from the face.
      const ax = tx - 6;
      const ay = ty - 6;
      if ((ay >= -1 && ay <= 3 && Math.abs(ax) <= 0) || (ay >= -4 && ay <= -1 && Math.abs(ax) <= ay + 4)) {
        return [52, 52, 58];
      }
      return base(tx, ty, 11);
    },
    left: (u, v) => {
      const tx = Math.floor(u * N);
      const ty = Math.floor(v * N);
      const panel = tx >= 1 && tx <= N - 2 && ty >= 2 && ty <= 10;
      const eye = ty >= 3 && ty <= 6 && ((tx >= 2 && tx <= 4) || (tx >= 8 && tx <= 10));
      if (eye) return (tx === 3 || tx === 9) && ty === 4 ? [214, 240, 255] : [28, 28, 34];
      if (ty === 8 && tx >= 4 && tx <= 8) return [28, 28, 34];
      if (panel) return hash(tx, ty, 12) < 0.3 ? [76, 76, 84] : [94, 94, 100];
      return base(tx, ty, 12);
    },
    right: (u, v) => {
      const tx = Math.floor(u * N);
      const ty = Math.floor(v * N);
      const d = Math.hypot(tx - 6, ty - 6);
      if (d < 1) return [255, 96, 80];
      if (d < 2.3) return [196, 28, 28];
      return base(tx, ty, 13);
    },
  });
  return c.outline();
}

/** Cops & Robbers on graphs: a cop and a robber head on a small pursuit graph. */
function iconCops() {
  const c = new Canvas(ICON, ICON);
  const nodes = {
    a: [6, 24],
    b: [17, 26],
    c: [12, 15],
    d: [23, 17],
    e: [25, 6],
    f: [13, 5],
  };
  const edges = ["ab", "ac", "bc", "bd", "cd", "cf", "fe", "de"];
  const chase = new Set(["ac", "cd", "de"]);
  // Edges stay thin (no outline) so the graph reads as lines, not scaffolding.
  const graph = new Canvas(ICON, ICON);
  for (const [p, q] of edges) {
    const [x0, y0] = nodes[p];
    const [x1, y1] = nodes[q];
    const col = chase.has(p + q) ? [236, 70, 56] : [196, 190, 172];
    graph.line(x0 + 1, y0 + 1, x1 + 1, y1 + 1, chase.has(p + q) ? [110, 24, 20] : [70, 68, 62]);
    graph.line(x0, y0, x1, y1, col);
  }
  for (const key of ["b", "c", "d", "f"]) {
    const [x, y] = nodes[key];
    c.rect(x - 1, y - 1, 3, 3, (i, j) => (i === x - 1 || j === y - 1 ? [214, 214, 220] : [140, 140, 148]));
  }
  const skin = { s: [226, 170, 128], S: [190, 132, 96] };
  const cop = [
    ".nnnnnnn.",
    "nnnnynnnn",
    "nnnnnnnnn",
    "kkkkkkkkk",
    "sssssssss",
    "swbsssbwS",
    "sssssssSS",
    "ssssSssSS",
    "sssmmmsSS",
  ];
  const robber = [
    ".ggggggg.",
    "ggggggggg",
    "ggggggggg",
    "sssssssss",
    "kkkkkkkkk",
    "kwbkkkwbk",
    "kkkkkkkkk",
    "sStStStSS",
    "SSSmmmSSS",
  ];
  const pal = {
    ...skin,
    n: [36, 56, 128],
    y: [244, 196, 40],
    k: [24, 24, 28],
    w: [250, 250, 250],
    b: [40, 80, 170],
    m: [140, 70, 56],
    g: [56, 56, 62],
    t: [120, 86, 62],
  };
  c.stamp(cop, pal, nodes.a[0] - 4, nodes.a[1] - 4);
  c.stamp(robber, pal, nodes.e[0] - 4, nodes.e[1] - 4);
  c.outline();
  graph.draw(c);
  return graph;
}

/** Favicon: an inventory-style grass block, bold enough to read at 16px. */
function iconGrassBlock() {
  const c = new Canvas(ICON, ICON);
  const N = 8;
  const at = (u, v) => [Math.floor(u * N), Math.floor(v * N)];
  isoCube(c, 16, 1, 15, {
    top: (u, v) => pick(GRASS, ...at(u, v), 201),
    left: (u, v) => {
      const [tx, ty] = at(u, v);
      const drip = ty === 0 || (ty === 1 && hash(tx, 0, 202) < 0.5);
      return drip ? pick(GRASS, tx, ty, 203) : pick(DIRT, tx, ty, 204);
    },
    right: (u, v) => {
      const [tx, ty] = at(u, v);
      const drip = ty === 0 || (ty === 1 && hash(tx, 0, 205) < 0.5);
      return drip ? pick(GRASS, tx, ty, 206) : pick(DIRT, tx, ty, 207);
    },
  });
  return c.outline();
}

/** F1 Telemetry: a red race car with a chequered flag. */
function iconRaceCar() {
  const c = new Canvas(ICON, ICON);
  const red = { light: [242, 92, 74], mid: [204, 38, 34], dark: [136, 20, 22] };
  const tire = [38, 38, 42];

  c.rect(1, 9, 6, 3, (x, y) => (y === 9 ? red.light : red.dark)); // rear wing
  c.rect(4, 12, 2, 5, [90, 92, 98]);
  c.poly(
    [
      [4, 17],
      [8, 16.5],
      [11, 12.5],
      [15, 12.5],
      [17, 16],
      [22, 17],
      [31, 20.5],
      [31, 23],
      [4, 23],
    ],
    red.mid
  );
  // Bevel the body: light where open sky is above, dark along the floor.
  const body = new Canvas(ICON, ICON);
  body.draw(c);
  c.fill((x, y, cur) => {
    if (cur !== red.mid) return undefined;
    if (!body.get(x, y - 1)) return red.light;
    if (y === 22) return red.dark;
  });
  c.rect(7, 20, 19, 1, (x, y, cur) => (cur === red.mid ? [240, 240, 244] : cur)); // livery stripe
  c.disc(17.6, 15.4, 1.9, [244, 196, 40]); // helmet
  c.set(18, 15, [110, 200, 236]);
  c.rect(27, 23, 5, 2, (x, y) => (y === 23 ? red.mid : red.dark)); // front wing

  const wheel = (cx, cy, r) =>
    c.disc(cx, cy, r, (x, y, nx, ny) => {
      const d = Math.hypot(nx, ny);
      if (d < 0.38) return d < 0.15 ? [60, 60, 66] : [168, 170, 178];
      return nx + ny < -0.6 ? [70, 70, 76] : tire;
    });
  wheel(8.5, 23.5, 4);
  wheel(23, 24, 3.5);

  // Chequered flag.
  c.rect(24, 2, 1, 12, [120, 122, 128]);
  c.rect(25, 2, 6, 4, (x, y) => ((Math.floor((x - 25) / 2) + Math.floor((y - 2) / 2)) % 2 ? [24, 24, 28] : [244, 244, 248]));
  return c.outline();
}

/* ------------------------------------------------------------------ */
/* Resource-pack paintings (scale 5, cropped to existing slot sizes)   */
/* ------------------------------------------------------------------ */

const PACK_SCALE = 5;

/** Computer Science: a terminal on a desk, lit by a redstone lamp. */
function packComputerScience(w, h) {
  const c = new Canvas(w, h);
  c.fill(bricks(STONE_BRICK, 21));
  const deskTop = h - 7;

  // Redstone lamp glow first so the lamp sits on top of it.
  glow(c, 7, deskTop - 4, 16, [255, 170, 80], 0.45);
  glow(c, w / 2, 15, 26, [80, 220, 120], 0.12);

  // Desk.
  c.rect(0, deskTop, w, 2, (x, y) => (y === deskTop ? [196, 160, 106] : OAK.pal[0]));
  c.rect(0, deskTop + 2, w, h - deskTop - 2, planks(OAK, 22));

  // Monitor.
  const mx = Math.round(w / 2) - 18;
  const my = 3;
  const mw = 36;
  const mh = 23;
  c.rect(mx, my, mw, mh, (x, y) => {
    if (y === my || x === mx) return [190, 194, 200];
    if (y === my + mh - 1 || x === mx + mw - 1) return [96, 98, 106];
    return [150, 154, 160];
  });
  c.rect(mx + 2, my + 2, mw - 4, mh - 4, [10, 16, 14]);
  c.rect(mx + mw / 2 - 3, my + mh, 6, deskTop - my - mh, [80, 82, 90]);
  c.rect(mx + mw / 2 - 6, deskTop - 1, 12, 1, [104, 106, 114]);

  // Code: indented runs of "words" in syntax colours.
  const code = [
    [0, [3, 5, 2]],
    [2, [4, 7]],
    [4, [2, 3, 6]],
    [4, [5, 4]],
    [2, [3]],
    [2, [6, 2, 4]],
    [0, [2]],
  ];
  const syntax = [
    [96, 236, 118],
    [240, 214, 92],
    [120, 190, 255],
    [246, 140, 96],
  ];
  code.forEach(([indent, words], row) => {
    let x = mx + 4 + indent;
    const y = my + 4 + row * 2;
    words.forEach((len, n) => {
      c.rect(x, y, len, 1, syntax[(row + n) % syntax.length]);
      x += len + 1;
    });
  });
  text(c, ">_", mx + 4, my + mh - 8, [96, 236, 118]);

  // Keyboard on the desk lip.
  c.rect(mx + 8, deskTop - 1, 20, 2, (x, y) => (y === deskTop - 1 && x % 2 ? [150, 152, 160] : [58, 60, 66]));

  // Redstone lamp (left) and cactus pot (right).
  const lamp = { x: 3, y: deskTop - 8, s: 8 };
  c.rect(lamp.x, lamp.y, lamp.s, lamp.s, (x, y) => {
    const lx = x - lamp.x;
    const ly = y - lamp.y;
    if (lx === 0 || ly === 0 || lx === lamp.s - 1 || ly === lamp.s - 1) return [96, 54, 30];
    if (lx === 3 || ly === 3 || lx === 4 || ly === 4) return [176, 104, 50];
    return hash(x, y, 23) < 0.4 ? [255, 236, 170] : [250, 196, 104];
  });
  const px = w - 11;
  c.rect(px, deskTop - 5, 6, 5, (x, y) => (y === deskTop - 5 ? [186, 104, 70] : x === px + 5 ? [120, 60, 40] : [160, 84, 54]));
  c.rect(px + 1, deskTop - 14, 4, 9, (x, y) => (x === px + 1 ? [96, 170, 72] : (x + y) % 3 ? [70, 140, 54] : [44, 98, 38]));
  c.rect(px + 5, deskTop - 11, 2, 2, [70, 140, 54]);
  c.rect(px + 6, deskTop - 13, 1, 3, [70, 140, 54]);
  return c;
}

/** Data tools: a parchment map with a bar + line chart and a quill. */
function packDataTools(w, h) {
  const c = new Canvas(w, h);
  c.fill(planks(SPRUCE, 31));

  const x0 = 6;
  const y0 = 4;
  const x1 = w - 8;
  const y1 = h - 5;
  const ragged = (x, y) => (x === x0 || x === x1 || y === y0 || y === y1) && hash(x, y, 32) < 0.4;

  c.rect(x0 + 1, y0 + 1, x1 - x0 + 1, y1 - y0 + 1, (x, y, cur) => shade(cur, 0.55)); // shadow
  c.rect(x0, y0, x1 - x0 + 1, y1 - y0 + 1, (x, y, cur) => {
    if (ragged(x, y)) return cur;
    if (x === x0 + 1 || x === x1 - 1 || y === y0 + 1 || y === y1 - 1) return [176, 136, 84];
    const n = hash(x, y, 33);
    return n < 0.18 ? [222, 200, 150] : n > 0.86 ? [244, 230, 190] : [234, 216, 168];
  });

  const ink = [86, 58, 34];
  const ax = x0 + 6;
  const ay = y1 - 5;
  c.rect(ax, y0 + 5, 1, ay - y0 - 4, ink);
  c.rect(ax, ay, x1 - ax - 5, 1, ink);
  for (let ty = ay - 5; ty > y0 + 5; ty -= 5) c.set(ax - 1, ty, ink);

  const bars = [
    { h: 9, col: [56, 94, 196] },
    { h: 14, col: [44, 174, 84] },
    { h: 11, col: [196, 46, 44] },
    { h: 19, col: [234, 184, 44] },
    { h: 25, col: [84, 214, 222] },
  ];
  const points = [];
  bars.forEach((bar, i) => {
    const bx = ax + 4 + i * 8;
    const top = ay - bar.h;
    c.rect(bx, top, 5, bar.h, (x, y) => {
      if (x === bx || y === top) return mix(bar.col, [255, 255, 255], 0.35);
      if (x === bx + 4) return shade(bar.col, 0.65);
      return bar.col;
    });
    points.push([bx + 2, top - 4 - (i % 2)]);
  });
  for (let i = 1; i < points.length; i++) c.line(...points[i - 1], ...points[i], [52, 34, 22]);
  points.forEach(([px, py]) => c.rect(px, py, 2, 2, [52, 34, 22]));

  // Quill resting on the corner.
  tube(
    c,
    [w - 5, h - 3],
    [w - 13, h - 17],
    (t) => (t < 0.2 ? 0.6 : 1.6 * Math.sin(Math.min(1, (t - 0.1) / 0.8) * Math.PI) + 0.4),
    (t, side) => (t < 0.18 ? [30, 30, 34] : side > 0.2 ? [252, 252, 252] : side > -0.4 ? [222, 222, 228] : [168, 168, 178])
  );
  return c;
}

/** Mathematics: an enchanting table where the floating glyphs are maths. */
function packMathematics(w, h) {
  const c = new Canvas(w, h);
  const floorY = h - 7;
  const bookColors = [
    [140, 40, 40],
    [56, 88, 150],
    [60, 120, 60],
    [150, 110, 60],
    [112, 60, 132],
    [184, 164, 112],
  ];
  const ox = Math.round(w / 2) % 16;
  c.fill((x, y) => {
    if (y >= floorY) return bricks({ mortar: [24, 20, 30], pal: [[46, 40, 56], [40, 34, 50], [52, 46, 62]] }, 41)(x, y);
    const bx = (x - ox + 1600) % 16;
    const by = y % 16;
    if (by === 0 || by === 15 || by === 7 || by === 8) return by === 7 ? [128, 98, 58] : pick(OAK.pal, x, y, 42);
    if (bx === 0 || bx === 15) return OAK.pal[1];
    const col = Math.floor((x - ox + 1600) / 2);
    const shelf = Math.floor(y / 8);
    const n = hash(col, shelf, 43);
    const height = by < 7 ? 6 - by : 14 - by;
    if (n < 0.12 || height > 4 + Math.floor(n * 3)) return [34, 24, 18];
    return shade(bookColors[Math.floor(n * bookColors.length)], (x % 2 ? 0.85 : 1));
  });
  // Dim the library so the table and glyphs carry the picture.
  c.fill((x, y, cur) => (y < floorY ? shade(mix(cur, [40, 24, 70], 0.35), 0.62) : cur));
  vignette(c, w / 2, floorY - 14, w * 0.75, 0.25);
  glow(c, w / 2, floorY - 18, 24, [150, 96, 236], 0.5);

  // Enchanting table.
  const tw = 24;
  const tx = Math.round(w / 2 - tw / 2);
  const ty = floorY - 12;
  c.rect(tx, ty + 3, tw, 9, (x, y) => {
    const n = hash(x, y, 44);
    if (n > 0.95) return [132, 84, 210];
    const base = n < 0.4 ? [22, 14, 36] : n < 0.8 ? [32, 22, 52] : [46, 32, 74];
    return x === tx ? shade(base, 1.4) : x === tx + tw - 1 ? shade(base, 0.7) : base;
  });
  c.rect(tx, ty, tw, 3, (x, y) => (y === ty ? [214, 62, 62] : y === ty + 2 ? [128, 22, 32] : [176, 32, 42]));
  for (const cx of [tx, tx + tw - 2]) c.rect(cx, ty, 2, 2, (x, y) => (y === ty ? [170, 248, 248] : [72, 210, 220]));

  // Floating open book.
  const bkx = Math.round(w / 2);
  const bky = ty - 8;
  c.rect(bkx - 7, bky + 1, 15, 4, [104, 58, 30]);
  c.rect(bkx - 6, bky, 6, 4, (x, y) => (y % 2 ? [214, 198, 156] : [244, 232, 200]));
  c.rect(bkx + 1, bky, 6, 4, (x, y) => (y % 2 ? [214, 198, 156] : [244, 232, 200]));
  c.rect(bkx, bky, 1, 5, [86, 46, 24]);

  // Maths glyphs (drawn 2x, with a dark halo) drifting up from the book.
  const glyphs = [
    ["sigma", 5, 6, [220, 204, 255]],
    ["pi", 27, 3, [164, 234, 255]],
    ["integral", w - 14, 5, [248, 242, 255]],
    ["infinity", 4, 30, [164, 234, 255]],
    ["root", w - 17, 28, [220, 204, 255]],
    ["nabla", Math.round(w / 2) - 5, 21, [248, 242, 255]],
  ];
  const glyphLayer = new Canvas(w, h);
  for (const [name, gx, gy, col] of glyphs) {
    MATH_GLYPHS[name].forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (ch === "#") glyphLayer.rect(gx + i * 2, gy + j * 2, 2, 2, col);
      })
    );
  }
  glyphLayer.outline([36, 16, 66]);
  c.draw(glyphLayer);
  for (let i = 0; i < 14; i++) {
    const a = hash(i, 0, 45) * Math.PI * 2;
    const d = 6 + hash(i, 1, 45) * 16;
    c.set(bkx + Math.cos(a) * d, bky - 2 + Math.sin(a) * d * 0.6, i % 3 ? [196, 160, 255] : [255, 255, 255]);
  }
  return c;
}

/** Physics: an atom glowing in deep space. */
function packPhysics(w, h) {
  const c = new Canvas(w, h);
  skyGradient(c, [
    [8, 8, 24],
    [16, 12, 40],
    [28, 18, 62],
    [40, 22, 78],
  ]);
  stars(c, { density: 0.02, seed: 51, colors: [[255, 255, 255], [190, 210, 255], [255, 236, 190]] });
  sparkle(c, 9, 10, 1, [255, 255, 255], [150, 170, 230]);
  sparkle(c, w - 9, h - 12, 1, [255, 255, 255], [150, 170, 230]);

  const cx = w / 2;
  const cy = h / 2;
  const orbit = (rot, plot) => {
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    for (let t = 0; t < Math.PI * 2; t += 0.004) {
      const ex = 27 * Math.cos(t);
      const ey = 9.5 * Math.sin(t);
      plot(cx + ex * cr - ey * sr, cy + ex * sr + ey * cr, t);
    }
  };
  const rots = [0, Math.PI / 3, (2 * Math.PI) / 3];
  for (const rot of rots) {
    orbit(rot, (x, y) => {
      c.set(x + 1, y, [44, 72, 150]);
      c.set(x, y + 1, [44, 72, 150]);
    });
  }
  for (const rot of rots) orbit(rot, (x, y) => c.set(x, y, [120, 204, 255]));

  // Electrons.
  rots.forEach((rot, i) => {
    const t = 0.7 + i * 2.2;
    const ex = 27 * Math.cos(t);
    const ey = 9.5 * Math.sin(t);
    const px = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
    const py = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
    c.disc(px, py, 2.6, [70, 150, 255]);
    c.disc(px, py, 1.6, [214, 248, 255]);
  });

  // Nucleus: protons and neutrons.
  const nucleons = [
    [0, 0, 0],
    [-2.6, -1.4, 1],
    [2.4, -1.6, 0],
    [-2.2, 2, 0],
    [2.3, 1.9, 1],
    [0.2, -3.2, 1],
    [0, 3.2, 0],
  ];
  const nucleus = new Canvas(w, h);
  for (const [dx, dy, kind] of nucleons) {
    const base = kind ? [176, 178, 192] : [222, 64, 60];
    nucleus.disc(cx + dx, cy + dy, 2.3, (x, y, nx, ny) => (nx + ny < -0.7 ? mix(base, [255, 255, 255], 0.45) : nx + ny > 0.6 ? shade(base, 0.62) : base));
  }
  nucleus.outline([20, 10, 30]);
  c.draw(nucleus);
  return c;
}

/** SJSU: Tower Hall under a blue-and-gold sky, palm tree out front. */
function packSjsu(w, h) {
  const c = new Canvas(w, h);
  const ground = h - 9;
  skyGradient(c, [
    [0, 46, 108],
    [14, 82, 156],
    [60, 134, 206],
    [138, 192, 236],
  ], 0, ground);
  grassGround(c, ground, 61);

  // Square sun and flat clouds.
  c.rect(w - 15, 5, 8, 8, (x, y) => (x >= w - 13 && x < w - 9 && y >= 7 && y < 11 ? [255, 240, 170] : [250, 196, 56]));
  const cloud = (x, y, cw) => {
    c.rect(x, y, cw, 2, [246, 250, 255]);
    c.rect(x + 2, y - 1, cw - 5, 1, [246, 250, 255]);
    c.rect(x, y + 2, cw, 1, [206, 222, 240]);
  };
  cloud(2, 9, 13);
  cloud(w - 24, 20, 15);

  const stucco = { light: [244, 230, 194], mid: [224, 206, 166], dark: [188, 168, 130] };
  const roof = { light: [214, 118, 74], mid: [184, 90, 56], dark: [138, 62, 40] };
  const opening = [44, 40, 54];

  // Side wing.
  const wx0 = 41;
  const wx1 = w - 3;
  c.rect(wx0, ground - 15, wx1 - wx0, 15, (x, y) => (y === ground - 15 ? stucco.dark : stucco.mid));
  c.rect(wx0 - 1, ground - 19, wx1 - wx0 + 2, 4, (x, y) => (y === ground - 19 ? roof.light : (x + y) % 4 === 0 ? roof.dark : roof.mid));
  for (let x = wx0 + 3; x < wx1 - 2; x += 5) {
    c.rect(x, ground - 11, 2, 5, opening);
    c.set(x, ground - 11, stucco.mid);
    c.rect(x, ground - 6, 2, 1, stucco.light);
  }

  // Tower Hall.
  const tx0 = 27;
  const tx1 = 40;
  const tTop = 18;
  c.rect(tx0, tTop, tx1 - tx0 + 1, ground - tTop, (x) => (x <= tx0 + 1 ? stucco.dark : x >= tx1 - 2 ? stucco.light : stucco.mid));
  c.rect(tx0 - 1, tTop - 1, tx1 - tx0 + 3, 2, (x, y) => (y === tTop - 1 ? stucco.light : stucco.dark));
  const apex = (tx0 + tx1 + 1) / 2;
  c.poly(
    [
      [apex, 5],
      [tx1 + 2.5, tTop - 1],
      [tx0 - 1.5, tTop - 1],
    ],
    (x, y) => {
      if ((y - 5) % 3 === 2) return roof.dark;
      return x + 0.5 < apex ? roof.mid : roof.light;
    }
  );
  c.rect(Math.floor(apex) - 1, 2, 2, 4, [234, 184, 52]); // finial
  c.rect(Math.floor(apex), 0, 1, 3, [120, 112, 100]);
  c.rect(Math.floor(apex) + 1, 0, 5, 1, [0, 86, 162]); // SJSU blue + gold banner
  c.rect(Math.floor(apex) + 1, 1, 5, 1, [229, 168, 35]);
  c.rect(Math.floor(apex) + 1, 2, 4, 1, [0, 86, 162]);

  const arch = (x, y, aw, ah, col) => {
    c.rect(x, y, aw, ah, col);
    c.set(x, y, stucco.mid);
    c.set(x + aw - 1, y, stucco.mid);
  };
  arch(tx0 + 3, tTop + 3, 3, 7, opening); // belfry
  arch(tx1 - 5, tTop + 3, 3, 7, opening);
  c.rect(tx0 + 2, tTop + 10, tx1 - tx0 - 3, 1, stucco.light);
  for (const wy of [tTop + 14, tTop + 22]) {
    c.rect(tx0 + 4, wy, 2, 4, [64, 78, 108]);
    c.rect(tx1 - 5, wy, 2, 4, [64, 78, 108]);
    c.rect(tx0 + 3, wy + 4, 4, 1, stucco.light);
    c.rect(tx1 - 6, wy + 4, 4, 1, stucco.light);
  }
  arch(tx0 + 5, ground - 8, 4, 8, [78, 48, 30]); // door
  c.set(tx0 + 7, ground - 4, [234, 184, 52]);

  // Palm tree.
  const trunkX = (y) => 13 + Math.round(Math.sin((ground - y) / 12) * 1.5);
  for (let y = 23; y < ground; y++) {
    const x = trunkX(y);
    const ringy = y % 3 === 0;
    c.set(x, y, ringy ? [92, 68, 44] : [138, 104, 66]);
    c.set(x + 1, y, ringy ? [72, 52, 34] : [112, 84, 54]);
  }
  const crownX = trunkX(23) + 0.5;
  const crownY = 23;
  const fronds = [-2.8, -2.2, -1.5, -0.6, 0.3, 0.9];
  for (const ang of fronds) {
    for (let s = 0; s < 9; s++) {
      const fx = crownX + Math.cos(ang) * s * 1.2;
      const fy = crownY + Math.sin(ang) * s * 0.9 + (s * s) / 14;
      c.set(fx, fy, s % 2 ? [52, 128, 56] : [72, 156, 64]);
      c.set(fx, fy + 1, [34, 92, 40]);
    }
  }
  c.rect(Math.floor(crownX) - 1, crownY, 3, 2, [110, 72, 40]);

  // Shrubs along the base.
  leafBlob(c, 0, ground - 5, 9, 5, 62);
  leafBlob(c, 18, ground - 4, 8, 4, 63);
  leafBlob(c, 42, ground - 4, 10, 4, 64);
  leafBlob(c, w - 11, ground - 5, 11, 5, 65);
  return c;
}

/* ------------------------------------------------------------------ */
/* Server media stills (80x45 paintings -> 640x360)                    */
/* ------------------------------------------------------------------ */

const PAINT_W = 80;
const PAINT_H = 45;
const PAINT_SCALE = 8;

/** SCRUGS Lab: a graph-embedded torus floating over a manifold grid. */
function paintScrugs() {
  const c = new Canvas(PAINT_W, PAINT_H);
  skyGradient(c, [
    [10, 6, 26],
    [22, 12, 50],
    [38, 20, 78],
    [54, 26, 96],
  ]);
  stars(c, { density: 0.018, seed: 71, colors: [[255, 255, 255], [214, 196, 255]], until: 26 });

  // Perspective grid floor (a flat slice of 3-space), lines exactly 1px wide.
  const horizon = 28;
  const vpx = 32;
  const depthAt = (y) => 36 / (y - horizon + 0.5);
  c.fill((x, y) => {
    if (y < horizon) return undefined;
    const near = (y - horizon) / (PAINT_H - horizon);
    const d = y - horizon + 0.5;
    const worldX = ((x + 0.5 - vpx) * 2.4) / d;
    const pixelW = 2.4 / d;
    const colLine = (((worldX % 1) + 1) % 1) < pixelW;
    const rowLine = Math.floor(depthAt(y)) !== Math.floor(depthAt(y + 1));
    const base = mix([20, 10, 42], [46, 20, 78], near);
    if (!(rowLine || colLine)) return base;
    return mix(base, [160, 104, 240], 0.25 + 0.5 * near);
  });

  torus(c, {
    cx: 32,
    cy: 21,
    R: 15,
    r: 7,
    tilt: 1.05,
    ramp: [
      [52, 24, 90],
      [84, 44, 140],
      [118, 74, 188],
      [158, 116, 228],
      [204, 172, 252],
      [236, 222, 255],
    ],
    uSeg: 10,
    vSeg: 5,
    lineW: 0.06,
    lineShade: 0.62,
    vertex: [255, 214, 92],
  });

  // Side chalk-board: a K4 graph and Euler's formula for the torus.
  const bx = 56;
  const by = 6;
  c.rect(bx - 1, by - 1, 22, 25, [96, 66, 40]);
  c.rect(bx, by, 20, 23, (x, y) => (hash(x, y, 72) < 0.12 ? [44, 76, 56] : [36, 66, 48]));
  const chalk = [228, 236, 230];
  const nodes = [
    [bx + 10, by + 3],
    [bx + 3, by + 13],
    [bx + 17, by + 13],
    [bx + 10, by + 9],
  ];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) c.line(...nodes[i], ...nodes[j], [170, 190, 178]);
  }
  for (const [nx, ny] of nodes) {
    c.rect(nx - 1, ny - 1, 3, 3, [255, 214, 92]);
    c.set(nx, ny, [255, 246, 200]);
  }
  text(c, "χ=0", bx + 5, by + 16, chalk); // Euler characteristic of the torus
  return c;
}

/** Galaxies + Star Clusters Lab: a spiral galaxy over an observatory. */
function paintGalaxies() {
  const c = new Canvas(PAINT_W, PAINT_H);
  skyGradient(c, [
    [4, 6, 20],
    [10, 12, 36],
    [22, 18, 58],
    [40, 26, 78],
  ]);
  stars(c, { density: 0.025, seed: 81, colors: [[255, 255, 255], [190, 210, 255], [255, 226, 180]] });

  // Logarithmic spiral galaxy, tilted, quantised into a cool palette.
  const gx = 52;
  const gy = 15;
  const levels = [null, [52, 40, 110], [92, 76, 170], [140, 140, 226], [210, 214, 255], [255, 244, 210]];
  c.fill((x, y, cur) => {
    const dx = (x + 0.5 - gx) / 1;
    const dy = (y + 0.5 - gy) / 0.48;
    const rot = 0.35;
    const rx = dx * Math.cos(rot) - dy * Math.sin(rot);
    const ry = dx * Math.sin(rot) + dy * Math.cos(rot);
    const r = Math.hypot(rx, ry);
    if (r > 24) return undefined;
    const theta = Math.atan2(ry, rx);
    const arm = Math.pow(Math.max(0, Math.cos(2 * (theta - 1.9 * Math.log(r + 1)))), 2.5);
    const core = Math.exp(-r / 3.6);
    const fade = Math.max(0, 1 - r / 24);
    const val = core * 1.35 + arm * fade * 0.8 + fade * 0.14 + (hash(x, y, 82) - 0.5) * 0.12;
    const idx = Math.floor(Math.min(0.999, Math.max(0, val)) * levels.length);
    return levels[idx] ?? cur;
  });
  sparkle(c, 16, 8, 2, [255, 255, 255], [170, 190, 255]);
  sparkle(c, 30, 4, 1, [255, 255, 240], [255, 214, 140]);
  sparkle(c, 73, 31, 1, [255, 255, 255], [170, 190, 255]);

  // Rolling grass hill at night.
  const hill = (x) => 35 - Math.round(3 * Math.sin(x / 13) + 2 * Math.sin(x / 5.5 + 1));
  c.fill((x, y) => {
    const top = hill(x);
    if (y < top) return undefined;
    const col = y < top + 2 ? pick(GRASS, x, y, 83) : pick(DIRT, x, y, 84);
    return shade(col, 0.42);
  });

  // Observatory: stone drum, dome with an open slit, telescope peeking out.
  const ox = 16;
  const baseY = hill(ox) - 1;
  c.rect(ox - 8, baseY - 7, 17, 8, (x, y) => (y === baseY - 7 ? [118, 118, 128] : bricks(STONE_BRICK, 85)(x, y).map((v) => v + 16)));
  c.disc(ox + 0.5, baseY - 7, 8.2, (x, y, nx, ny) => {
    if (y >= baseY - 7) return undefined;
    if (Math.abs(nx + 0.05) < 0.16 && ny < -0.1) return [14, 14, 26];
    return nx < -0.35 ? [150, 156, 170] : nx > 0.45 ? [96, 100, 114] : [196, 200, 212];
  });
  tube(c, [ox + 0.5, baseY - 9], [ox + 12, baseY - 16], () => 1.1, (t, side) => (t > 0.86 ? [140, 214, 238] : side > 0 ? [226, 138, 92] : [170, 86, 52]));
  c.rect(ox - 2, baseY - 3, 3, 4, [60, 44, 30]);
  c.set(ox + 5, baseY - 4, [255, 214, 120]);
  return c;
}

/** Standard Precision Bellows: a factory line with bellows and a maintenance alert. */
function paintStandardPrecision() {
  const c = new Canvas(PAINT_W, PAINT_H);
  const floorY = 36;

  // Corrugated iron walls with a darker wainscot.
  c.fill((x, y) => {
    if (y >= floorY) return undefined;
    if (y < 3) return [44, 46, 52];
    const ridge = x % 4;
    const base = y > 26 ? [70, 74, 82] : [118, 124, 134];
    return ridge === 0 ? shade(base, 0.78) : ridge === 1 ? shade(base, 1.12) : base;
  });
  c.rect(0, 26, PAINT_W, 1, [52, 54, 60]);
  c.rect(0, 2, PAINT_W, 1, [30, 30, 36]);

  // Polished concrete floor with a hazard stripe.
  c.fill((x, y) => {
    if (y < floorY) return undefined;
    if (y === floorY) return Math.floor((x + y) / 2) % 2 ? [24, 24, 28] : [236, 186, 40];
    return pick([[132, 134, 140], [124, 126, 132], [140, 142, 148]], x, y, 91);
  });

  // Hanging lamps and their light pools.
  for (const lx of [36, 60]) {
    c.rect(lx, 3, 1, 4, [40, 40, 46]);
    c.rect(lx - 2, 7, 5, 2, [60, 62, 70]);
    c.rect(lx - 1, 9, 3, 1, [255, 232, 150]);
    glow(c, lx + 0.5, 14, 13, [255, 236, 170], 0.32);
  }

  // Maintenance monitor: vibration trace with a predicted failure spike.
  const mx = 4;
  const my = 6;
  c.rect(mx, my, 24, 15, (x, y) => (y === my || x === mx ? [150, 154, 160] : y === my + 14 || x === mx + 23 ? [70, 72, 80] : [110, 114, 120]));
  c.rect(mx + 2, my + 2, 20, 11, [12, 20, 18]);
  c.rect(mx + 11, my + 15, 2, 11, [60, 62, 70]);
  let prev = null;
  for (let i = 0; i < 18; i++) {
    const x = mx + 3 + i;
    const wobble = Math.round(Math.sin(i * 1.3) * 1.2);
    const spike = i === 13 ? -5 : i === 14 ? -2 : 0;
    const y = my + 9 + wobble + spike;
    if (prev) c.line(prev[0], prev[1], x, y, i >= 12 && i <= 15 ? [255, 90, 70] : [96, 236, 118]);
    prev = [x, y];
  }
  c.rect(mx + 3, my + 4, 18, 1, (x) => (x % 2 ? [236, 186, 40] : undefined)); // threshold
  c.stamp(
    ["..#..", ".#!#.", "##!##", "#####"],
    { "#": [244, 196, 40], "!": [24, 24, 28] },
    mx + 17,
    my + 2
  );

  // Press machine at the end of the line.
  const px = 60;
  c.rect(px, 12, 16, floorY - 12, (x, y) => (x === px ? [176, 180, 188] : x === px + 15 ? [90, 94, 102] : [138, 142, 150]));
  c.rect(px - 6, 16, 8, 6, (x, y) => (y === 16 ? [176, 180, 188] : [110, 114, 122])); // press head
  c.rect(px - 4, 22, 4, 3, [72, 76, 84]);
  c.rect(px + 3, 15, 9, 6, [20, 34, 44]);
  c.rect(px + 4, 16, 3, 1, [96, 236, 118]);
  c.rect(px + 4, 18, 6, 1, [96, 236, 118]);
  c.disc(px + 12.5, 25.5, 1.6, [214, 40, 36]);
  c.set(px + 12, 25, [255, 120, 100]);
  c.rect(px + 2, 29, 12, 1, (x) => (Math.floor(x / 2) % 2 ? [24, 24, 28] : [236, 186, 40]));

  // Conveyor belt.
  const beltY = 29;
  c.rect(2, beltY, px - 2, 1, [36, 36, 40]);
  c.rect(2, beltY + 1, px - 2, 3, (x, y) => ((x + (y === beltY + 2 ? 0 : 2)) % 4 === 0 ? [40, 40, 46] : y === beltY + 1 ? [116, 118, 126] : [86, 88, 96]));
  for (const legX of [6, 30, 54]) c.rect(legX, beltY + 4, 2, floorY - beltY - 4, [70, 72, 80]);

  // Metal bellows riding the belt.
  const bellows = (bx, bw) => {
    const top = beltY - 7;
    c.rect(bx, top, bw, 7, (x, y) => {
      if (x === bx || x === bx + bw - 1) return y === top ? [220, 224, 232] : [150, 156, 166];
      const fold = (x - bx) % 2;
      const lit = y < top + 3;
      return fold ? (lit ? [236, 240, 246] : [190, 196, 206]) : lit ? [150, 156, 168] : [104, 110, 122];
    });
    c.rect(bx - 1, top + 1, 1, 5, [96, 100, 112]);
    c.rect(bx + bw, top + 1, 1, 5, [96, 100, 112]);
  };
  bellows(19, 9);
  bellows(32, 9);
  bellows(45, 9);
  return c;
}

/** SEP Lab: k-means clusters on the board, NLP chat on the desk monitor. */
function paintSepLab() {
  const c = new Canvas(PAINT_W, PAINT_H);
  const deskY = 31;
  c.fill(planks(BIRCH, 101));

  // Window with sky and a Minecraft cloud.
  const wx = 3;
  const wy = 3;
  c.rect(wx - 1, wy - 1, 17, 15, [120, 90, 56]);
  c.rect(wx, wy, 15, 13, (x, y) => ditherStops([[110, 170, 240], [150, 200, 246], [190, 224, 252]], (y - wy) / 12, x, y));
  c.rect(wx + 2, wy + 3, 7, 2, [250, 252, 255]);
  c.rect(wx + 4, wy + 2, 3, 1, [250, 252, 255]);
  c.rect(wx + 7, wy, 1, 13, [120, 90, 56]);
  c.rect(wx, wy + 6, 15, 1, [120, 90, 56]);

  // Whiteboard with three clusters and their centroids.
  const bx = 22;
  const by = 2;
  const bw = 36;
  const bh = 20;
  c.rect(bx - 1, by - 1, bw + 2, bh + 2, [150, 154, 162]);
  c.rect(bx, by, bw, bh, [244, 246, 248]);
  c.rect(bx + 3, by + bh, bw - 6, 1, [110, 114, 122]); // marker tray
  c.set(bx + 6, by + bh - 1, [214, 40, 36]);
  c.set(bx + 8, by + bh - 1, [40, 80, 200]);
  const clusters = [
    { cx: bx + 9, cy: by + 7, col: [214, 52, 48], seed: 1 },
    { cx: bx + 24, cy: by + 6, col: [44, 92, 210], seed: 2 },
    { cx: bx + 18, cy: by + 15, col: [40, 160, 70], seed: 3 },
  ];
  for (const k of clusters) {
    for (let i = 0; i < 9; i++) {
      const a = hash(i, k.seed, 102) * Math.PI * 2;
      const d = 1.5 + hash(i, k.seed, 103) * 3.5;
      c.set(k.cx + Math.cos(a) * d * 1.3, k.cy + Math.sin(a) * d, k.col);
    }
    c.set(k.cx, k.cy, [24, 24, 28]);
    c.set(k.cx - 1, k.cy - 1, [24, 24, 28]);
    c.set(k.cx + 1, k.cy + 1, [24, 24, 28]);
    c.set(k.cx - 1, k.cy + 1, [24, 24, 28]);
    c.set(k.cx + 1, k.cy - 1, [24, 24, 28]);
  }
  c.line(bx + 15, by + 1, bx + 13, by + bh - 2, [190, 194, 202]); // decision boundaries
  c.line(bx + 14, by + 10, bx + bw - 2, by + 11, [190, 194, 202]);

  // Bookshelf.
  const sx = 62;
  c.rect(sx, 0, PAINT_W - sx, deskY, (x, y) => {
    const by2 = y % 10;
    if (by2 === 0 || x === sx || x === PAINT_W - 1) return OAK.pal[0];
    const n = hash(Math.floor(x / 2), Math.floor(y / 10), 104);
    if (by2 < 3 && n > 0.6) return [40, 28, 20];
    return shade([[140, 40, 40], [56, 88, 150], [60, 120, 60], [150, 110, 60], [112, 60, 132]][Math.floor(n * 5)], x % 2 ? 0.85 : 1);
  });

  // Desk.
  c.rect(0, deskY, PAINT_W, 1, [100, 66, 38]);
  c.rect(0, deskY + 1, PAINT_W, PAINT_H - deskY - 1, planks(DARK_OAK, 105));
  for (const dx of [8, 54]) {
    c.rect(dx, deskY + 4, 16, 4, [80, 54, 30]);
    c.rect(dx + 6, deskY + 5, 4, 1, [176, 150, 90]);
  }

  // Monitor 1: code. Monitor 2: chat bubbles (NLP).
  const monitor = (x, y, mw, mh) => {
    c.rect(x, y, mw, mh, (i, j) => (j === y || i === x ? [70, 72, 80] : [40, 42, 48]));
    c.rect(x + 1, y + 1, mw - 2, mh - 2, [14, 20, 26]);
    c.rect(x + mw / 2 - 1, y + mh, 2, deskY - y - mh, [60, 62, 70]);
  };
  monitor(6, 19, 15, 10);
  [
    [0, 5],
    [2, 7],
    [2, 4],
    [0, 3],
  ].forEach(([ind, len], i) => c.rect(8 + ind, 21 + i * 2, len, 1, i % 2 ? [240, 214, 92] : [96, 236, 118]));
  monitor(40, 20, 17, 10);
  c.rect(42, 22, 8, 3, [96, 160, 255]);
  c.set(42, 25, [96, 160, 255]);
  c.rect(43, 23, 6, 1, [220, 236, 255]);
  c.rect(47, 26, 8, 2, [214, 218, 226]);
  c.set(54, 28, [214, 218, 226]);
  c.rect(48, 26, 6, 1, [120, 124, 134]);

  // Keyboard, mug, plant.
  c.rect(23, deskY - 1, 14, 1, (x) => (x % 2 ? [176, 178, 186] : [86, 88, 96]));
  c.rect(31, deskY - 4, 3, 3, [236, 236, 240]);
  c.set(34, deskY - 3, [236, 236, 240]);
  c.rect(31, deskY - 4, 3, 1, [92, 54, 30]);
  c.rect(59, deskY - 4, 4, 4, [160, 84, 54]);
  leafBlob(c, 57, deskY - 9, 8, 5, 106);
  return c;
}

/* ------------------------------------------------------------------ */
/* Reading covers (45x68 -> 180x272, like the other cover thumbnails)  */
/* The Reading tab crops covers to the middle band, so the key picture */
/* sits between rows ~19 and ~49.                                      */
/* ------------------------------------------------------------------ */

const COVER_W = 45;
const COVER_H = 68;
const COVER_SCALE = 4;

/** Cover background plus a shaded spine strip down the left edge. */
function coverBase(bg) {
  const c = new Canvas(COVER_W, COVER_H);
  c.fill(bg);
  c.fill((x, y, cur) => {
    if (x === 0) return shade(cur, 0.55);
    if (x === 1) return shade(cur, 0.75);
    if (x === 2) return mix(cur, [255, 255, 255], 0.12);
  });
  return c;
}

/** Hatcher, Algebraic Topology: a torus with its two generator loops a and b. */
function coverAlgebraicTopology() {
  const navy = [
    [14, 20, 54],
    [20, 30, 76],
    [30, 44, 100],
  ];
  const c = coverBase((x, y) => ditherStops([navy[0], navy[1], navy[2], navy[1], navy[0]], y / (COVER_H - 1), x, y));
  const cream = [244, 234, 206];
  const gold = [232, 182, 52];
  const ink = [6, 8, 26];

  c.rect(6, 3, 35, 1, gold);
  centeredText(c, "ALGEBRAIC", 6, cream, ink);
  centeredText(c, "TOPOLOGY", 13, cream, ink);
  c.rect(6, 20, 35, 1, gold);

  torus(c, {
    cx: 23,
    cy: 37,
    R: 12.5,
    r: 5.8,
    tilt: 1.0,
    ramp: [
      [18, 64, 84],
      [30, 100, 124],
      [52, 146, 164],
      [96, 192, 200],
      [176, 236, 232],
    ],
    loops: [
      // u = 0.25 is the front of the tube and v = 0.25 the band facing the
      // viewer, so loop a crosses the front and loop b shows as a full ring.
      { axis: "u", at: 0.15, width: 0.024, color: [238, 70, 60] },
      { axis: "v", at: 0.25, width: 0.04, color: gold },
    ],
  });

  c.rect(6, 55, 35, 1, gold);
  centeredText(c, "HATCHER", 59, gold, ink);
  return c;
}

/** Zeitz, The Art and Craft of Problem Solving: a crafting recipe for insight. */
function coverArtCraftProblemSolving() {
  const c = coverBase((x, y) =>
    ditherStops(
      [
        [200, 78, 46],
        [170, 54, 38],
        [128, 34, 30],
      ],
      y / (COVER_H - 1),
      x,
      y
    )
  );
  const cream = [252, 238, 204];
  const ink = [70, 16, 14];
  centeredText(c, "THE ART", 3, cream, ink);
  centeredText(c, "AND CRAFT", 9, cream, ink);
  centeredText(c, "OF PROBLEM", 15, cream, ink);
  centeredText(c, "SOLVING", 21, cream, ink);

  // Minecraft-style GUI panel with a rounded black rim.
  const px = 4;
  const py = 29;
  const pw = 38;
  const ph = 26;
  c.rect(px - 1, py - 1, pw + 2, ph + 2, (x, y, cur) => {
    const corner = (x === px - 1 || x === px + pw) && (y === py - 1 || y === py + ph);
    return corner ? cur : K;
  });
  c.rect(px, py, pw, ph, (x, y) => {
    if (x === px || y === py) return [255, 255, 255];
    if (x === px + pw - 1 || y === py + ph - 1) return [85, 85, 85];
    return [198, 198, 198];
  });

  const slot = (x, y) =>
    c.rect(x, y, 7, 7, (i, j) => {
      if (i === x || j === y) return [55, 55, 55];
      if (i === x + 6 || j === y + 6) return [255, 255, 255];
      return [139, 139, 139];
    });
  const items = {
    pencil: [["...pp", "..yyp", ".yyy.", "wyy..", "kw..."], { p: [236, 130, 150], y: [246, 196, 46], w: [232, 200, 150], k: [50, 50, 56] }],
    compass: [["..h..", "..g..", ".g.g.", ".g.g.", "g...k"], { h: [214, 214, 220], g: [96, 98, 108], k: [40, 40, 46] }],
    paper: [[".www.", ".wbw.", ".www.", ".wbw.", ".www."], { w: [250, 250, 244], b: [160, 160, 172] }],
    puzzle: [FONT["?"].map((row) => `.${row}.`), { "#": [150, 80, 230] }],
    bulb: [[".yyy.", "yyhyy", "yyyyy", ".yyy.", ".ggg."], { y: [255, 214, 72], h: [255, 255, 236], g: [120, 122, 130] }],
  };
  const recipe = [
    ["pencil", null, "compass"],
    [null, "puzzle", null],
    [null, "paper", null],
  ];
  const gx = px + 3;
  const gy = py + 3;
  recipe.forEach((row, j) =>
    row.forEach((item, i) => {
      slot(gx + i * 7, gy + j * 7);
      if (item) c.stamp(...items[item], gx + i * 7 + 1, gy + j * 7 + 1);
    })
  );
  c.stamp(["..#..", "..##.", "#####", "..##.", "..#.."], { "#": [124, 124, 124] }, gx + 22, gy + 8);
  const rx = gx + 28;
  const ry = gy + 7;
  slot(rx, ry);
  c.stamp(...items.bulb, rx + 1, ry + 1);
  for (const [sx, sy] of [
    [rx - 1, ry - 2],
    [rx + 3, ry - 3],
    [rx + 7, ry - 2],
  ]) {
    c.set(sx, sy, [255, 214, 72]);
  }

  centeredText(c, "PAUL ZEITZ", 60, [255, 214, 120], ink);
  return c;
}

/* ------------------------------------------------------------------ */
/* Title logo: blocky stone letters with a dark extrusion, MC-style    */
/* ------------------------------------------------------------------ */

// 16px-tall letters with 3px strokes. Widths vary; "I" carries serifs so the
// logo's bottom-right corner (where the splash text pins) stays solid.
const LOGO_FONT = {
  A: [
    "..#######..",
    ".#########.",
    "###########",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###########",
    "###########",
    "###########",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
  ],
  R: [
    "#########..",
    "##########.",
    "###########",
    "###.....###",
    "###.....###",
    "###.....###",
    "###########",
    "##########.",
    "#########..",
    "###...###..",
    "###....###.",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
  ],
  V: [
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    ".###...###.",
    ".###...###.",
    "..###.###..",
    "..###.###..",
    "...#####...",
    "...#####...",
    "....###....",
  ],
  G: [
    "..#########",
    ".##########",
    "###########",
    "###........",
    "###........",
    "###........",
    "###........",
    "###...#####",
    "###...#####",
    "###...#####",
    "###.....###",
    "###.....###",
    "###.....###",
    "###########",
    ".##########",
    "..#########",
  ],
  H: [
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###########",
    "###########",
    "###########",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
    "###.....###",
  ],
  I: [
    "#######",
    "#######",
    "#######",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "..###..",
    "#######",
    "#######",
    "#######",
  ],
};

function titleLogo(word) {
  const LETTER_H = 16;
  const GAP = 2;
  const SPACE = 4;
  const DEPTH = 5;
  // Extrusion steps go down and drift left, like the vanilla title.
  const depthOffset = (d) => [-Math.floor(d / 2), d];
  const pad = { left: 1 + Math.floor(DEPTH / 2), top: 1, right: 1, bottom: 1 + DEPTH };

  const glyphs = [...word];
  const textW = glyphs.reduce((w, ch, i) => w + (ch === " " ? SPACE : LOGO_FONT[ch][0].length) + (i ? GAP : 0), 0);
  const c = new Canvas(textW + pad.left + pad.right, LETTER_H + pad.top + pad.bottom);

  // Letter mask.
  const face = new Set();
  let cursor = pad.left;
  glyphs.forEach((ch, i) => {
    if (i) cursor += GAP;
    if (ch === " ") {
      cursor += SPACE;
      return;
    }
    LOGO_FONT[ch].forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === "#") face.add(`${cursor + x},${pad.top + y}`);
      })
    );
    cursor += LOGO_FONT[ch][0].length;
  });
  const isFace = (x, y) => face.has(`${x},${y}`);

  // Extrusion: deepest layer first so nearer layers overwrite it.
  for (let d = DEPTH; d >= 1; d--) {
    const [ox, oy] = depthOffset(d);
    const base = mix([84, 84, 92], [28, 28, 34], (d - 1) / (DEPTH - 1));
    for (const key of face) {
      const [x, y] = key.split(",").map(Number);
      const tx = x + ox;
      const ty = y + oy;
      if (isFace(tx, ty)) continue;
      c.set(tx, ty, hash(tx, ty, 300 + d) < 0.2 ? shade(base, 0.82) : base);
    }
  }

  // Stone face: vertical light-to-dark ramp, speckle, bevelled edges.
  for (const key of face) {
    const [x, y] = key.split(",").map(Number);
    const t = (y - pad.top) / (LETTER_H - 1);
    // Keep the face's darkest row well above the extrusion so the depth reads.
    let col = mix([236, 236, 238], [172, 172, 178], t);
    const n = hash(x, y, 310);
    if (n < 0.16) col = shade(col, 0.8);
    else if (n < 0.24) col = shade(col, 0.9);
    else if (n > 0.93) col = mix(col, [255, 255, 255], 0.4);
    if (!isFace(x, y - 1)) col = mix(col, [255, 255, 255], 0.6);
    else if (!isFace(x - 1, y)) col = mix(col, [255, 255, 255], 0.25);
    else if (!isFace(x + 1, y)) col = shade(col, 0.86);
    c.set(x, y, col);
  }

  return c.outline([8, 8, 10], { corners: true });
}

/* ------------------------------------------------------------------ */
/* 1.21-style GUI textures (shown at 2x by CSS)                        */
/* ------------------------------------------------------------------ */

/** Tileable dark translucent list background (per-pixel noise only, so it tiles). */
function menuListBackground() {
  const c = new Canvas(32, 32);
  c.fill((x, y) => {
    const n = hash(x, y, 401);
    const v = 6 + Math.floor(n * 16); // 6..21, faintly warm like 1.21's dark dirt
    const alpha = 150 + Math.floor(hash(x, y, 402) * 30); // ~59-70%
    return [v, v - 1, v - 2, alpha];
  });
  return c;
}

/** 32x2 separators: header is light over dark, footer is dark over light. */
function separator(lightFirst) {
  const c = new Canvas(32, 2);
  const light = (x) => [255, 255, 255, hash(x, 0, 411) < 0.5 ? 64 : 82];
  const dark = (x) => [0, 0, 0, hash(x, 1, 412) < 0.5 ? 176 : 204];
  for (let x = 0; x < 32; x++) {
    c.set(x, lightFirst ? 0 : 1, light(x));
    c.set(x, lightFirst ? 1 : 0, dark(x));
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

const logos = {
  "torus.png": iconTorus,
  "solar.png": iconSpyglass,
  "acm.png": iconBook,
  "lowla.png": iconNoteBlock,
  "riot.png": iconObserver,
  "cops.png": iconCops,
  "f1.png": iconRaceCar,
};
for (const [file, draw] of Object.entries(logos)) {
  await save(draw(), ICON_SCALE, pub("logos", file));
}
await save(iconGrassBlock(), 16, pub("favicon-source.png"));

const packs = {
  "computer-science.png": [packComputerScience, 330, 184],
  "data-tools.png": [packDataTools, 330, 240],
  "mathematics.png": [packMathematics, 330, 365],
  "physics.png": [packPhysics, 330, 332],
  "sjsu.png": [packSjsu, 330, 330],
};
for (const [file, [draw, width, height]] of Object.entries(packs)) {
  const [gw, gh] = gridFor(width, height, PACK_SCALE);
  await save(draw(gw, gh), PACK_SCALE, pub("resource-packs", file), { width, height });
}

const stills = {
  "scrugs.png": paintScrugs,
  "galaxies.png": paintGalaxies,
  "standard-precision.png": paintStandardPrecision,
  "sep-lab.png": paintSepLab,
};
for (const [file, draw] of Object.entries(stills)) {
  await save(draw(), PAINT_SCALE, pub("media", file));
}

// Reading covers use photos of the real book covers (public/activities/reading/*.jpg).
// The pixel-art cover drawers above are kept for books that have no cover.

const logo = titleLogo("AARAV GHAI");
await save(logo, Math.round(1520 / logo.w), pub("title", "logo.png"));

await save(menuListBackground(), 1, pub("textures", "gui", "menu_list_background.png"));
await save(separator(true), 1, pub("textures", "gui", "header_separator.png"));
await save(separator(false), 1, pub("textures", "gui", "footer_separator.png"));

console.log("pixel art written");
