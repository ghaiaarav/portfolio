# Aarav Ghai — Portfolio

A Minecraft-themed personal portfolio built with Next.js. The main menu mimics Minecraft's classic play screen, with each button routing to a different section of the portfolio.

**Live site:** [aaravghai.com](https://aaravghai.com)

## Features

- Rotating cubemap panorama background (persists across all pages)
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
