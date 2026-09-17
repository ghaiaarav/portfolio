# Aarav Ghai — Portfolio

A Minecraft-themed personal portfolio built with Next.js. The main menu mimics Minecraft's classic play screen, with each button routing to a different section of the portfolio.

**Live site:** [aaravghai.com](https://aaravghai.com) (after deployment)

## Features

- Rotating cubemap panorama background (persists across all pages)
- Minecraft-style GUI controls using vanilla button and scrollbar textures
- UI click sounds on every button press (`public/sounds/click.ogg`)
- Curated yellow splash text — edit in `content/portfolio.json` → `splashTexts`
- Projects, experience, skills, options, extracurriculars, blog, and honors
- All content editable via `content/portfolio.json` and MDX files

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Deploy to Vercel + Custom Domain

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Deploy (defaults work — framework: Next.js)
4. In Vercel project **Settings → Domains**, add `aaravghai.com` and `www.aaravghai.com`
5. At your domain registrar, add DNS records Vercel shows you:
   - **A record:** `@` → `76.76.21.21`
   - **CNAME:** `www` → `cname.vercel-dns.com`
6. Wait for DNS propagation (usually minutes, up to 48h)

## Project Structure

```
app/           → Next.js pages (routes)
components/    → Minecraft UI components
content/       → portfolio.json + MDX content
hooks/         → useMcSound (preloaded Audio click pool)
styles/        → minecraft.css design tokens
public/        → resume.pdf, sounds/click.ogg, panorama assets
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- gray-matter + react-markdown for MDX content
- CSS 3D transforms for panorama rotation
- HTMLAudioElement pool for UI click sounds (Kenney CC0)
