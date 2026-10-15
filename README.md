# SPECTRAL — Cinematic Landing Page

Next.js 16 + TypeScript + Tailwind CSS 4 cinematic scroll experience.
All hero image sequences are loaded from the jsDelivr CDN (`cdn.jsdelivr.net/gh/architecturezen8-cpu/spectral`), so the repo stays lightweight.

## Deploy to Vercel

### Option A — GitHub (recommended)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js. Leave all settings as default and click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # from this folder, follow the prompts
vercel --prod   # promote to production
```

## Notes

- **No environment variables are required** — the site is fully static/client-side and the API route is a simple hello-world.
- **Build command:** `next build` · **Output:** standard (Vercel handles everything).
- **Local dev:** `bun install && bun run dev` → http://localhost:3000
- Fonts (Cormorant Garamond, Inter, Noto) load via `next/font/google` at build time.
- Intro overlay stills are **100% lossless WebP** (`intro-desktop-v3.webp` / `intro-mobile-v3.webp`).
- If you push to GitHub, `.gitignore` already excludes `node_modules`, `.next`, logs and env files.
