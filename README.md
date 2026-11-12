# Aarav Ghai — Portfolio

A Minecraft-themed personal portfolio.

**Live site:** [aaravghai.com](https://www.aaravghai.com) (canonical URL lives in `lib/site.ts`)

## Features

- Rotating cubemap panorama background
- Minecraft-style GUI controls using vanilla button and scrollbar textures
- All content editable via `content/portfolio.json` and MDX files

## Editing Content

| What | Where |
|---|---|
| Projects, experience, skills, stats, links | `content/portfolio.json` |
| Splash texts | `content/portfolio.json` → `splashTexts[]` |
| Books (reading log) | `content/portfolio.json` → `activities.reading[]` — statuses: `reading`, `finished`, `coursework`, `queue` |
| Side quests (SkyBlock, etc.) | `content/portfolio.json` → `activities.sideQuests[]` |
| Minecraft skin | Replace `public/skin-notsaywhat.png` |
| Profile avatar | Replace `public/avatar.png` |
| Click sound | Replace `public/sounds/click.ogg` |
| Blog posts | `content/blog/*.mdx` |
| Resume PDF | Replace `public/resume.pdf` |
| Skills screen (skills, coursework, honors, resources) | `content/portfolio.json` → `skills[]`, `education[]`, `honors[]`, `resources[]` |
| Pixel-art logos, Server stills, pack art, book covers | `node scripts/generate-pixel-art.mjs` (writes into `public/`) |
| Panorama faces | `public/panorama*/0-5.webp` (keep them around 1024px WebP; they render blurred) |
| Social preview / favicon | `app/opengraph-image.png`, `app/icon.png`, `app/apple-icon.png` |
