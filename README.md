## Mindful

Mindful is a statically-exported Next.js 15 application that keeps your daily calm routine on-device. Track breathing sessions, log your mood, jot quick reflections, and watch your streak—no accounts or servers required.

### Features

- Guided 4-4-6 breathing timer with 1–2 minute presets and optional looping.
- Daily mood check-in with streak tracking and average mood stats.
- Journal entries and daily intention stored privately in `localStorage`.
- Minimal shadcn-inspired UI components (button, card, input, textarea, switch) styled with Tailwind CSS.
- Static export ready for GitHub Pages via an environment-driven `basePath`.

### Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Custom shadcn-style UI primitives in `components/ui`

## Local Development

Install dependencies (already done if you used `create-next-app`):

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the app. Updates are applied live thanks to Fast Refresh.

## Static Build & Preview

This project uses `output: "export"` so a static bundle is emitted into `out/`.

```bash
# Build the static site
npm run build

# Optionally preview the static output
npm run serve
```

## GitHub Pages Deployment

1. Set the `NEXT_PUBLIC_BASE_PATH` environment variable to your repository path before building:

   ```bash
   export NEXT_PUBLIC_BASE_PATH="/your-repo-name"
   npm run build
   ```

   The `basePath`/`assetPrefix` and routes adjust automatically when this variable is present.

2. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) handles automatic deployment to GitHub Pages on push to the main branch.

3. Enable GitHub Pages in your repository settings, pointing to GitHub Actions as the source.

When running locally you can omit `NEXT_PUBLIC_BASE_PATH`, and the app will use the root path.

## Project Structure Highlights

- `app/page.tsx` – Main dashboard with breathing, mood, journal, and stats sections.
- `lib/use-local-storage.ts` – Lightweight hook for `localStorage` backed state with hydration awareness.
- `components/ui/*` – Minimal shadcn-style UI components shared across the app.
- `tailwind.config.ts` & `postcss.config.mjs` – Tailwind 4-ready configuration and modern theme tokens.

Enjoy your mindful routine! Feel free to adapt the components and sections to suit your practice.
