# Mindful

Mindful is a private, on-device wellness tracker for guided breathing, daily mood check-ins, intentions, and short reflections. It is built with Next.js and exports as a static site.

## MVP features

- Guided 4–4–6 breathing with one- and two-minute sessions
- Pause, resume, reset, loop, and session-progress controls
- Daily mood check-ins with streak, average, and seven-day history
- Autosaved daily intentions
- Reflection creation, editing, deletion, and undo recovery
- Responsive layouts, visible keyboard focus, reduced-motion support, and accessible status updates
- Fully local persistence with no account or network dependency

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Development

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Validation

```bash
npm run lint
npm run build
```

The production build is exported to `out/`. Preview that exact output before a showcase or deployment:

```bash
npm run serve
```

Set `NEXT_PUBLIC_BASE_PATH` when deploying beneath a subpath such as GitHub Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/mindful npm run build
```

## Local data model

Mindful stores personal entries in the browser's `localStorage`:

| Key | Data |
| --- | --- |
| `mindful:breath-loop` | Loop preference |
| `mindful:moods` | Dated mood check-ins |
| `mindful:intentions` | Daily intentions indexed by date |
| `mindful:journals` | Reflection entries |

Breathing-session progress is intentionally temporary and resets after a refresh. Clearing browser site data removes all saved Mindful data; the MVP does not yet include accounts, synchronization, backup, or export.

## Project structure

- `app/page.tsx` — main wellness-tracker experience and state transitions
- `app/globals.css` — design tokens, responsive layout, and interaction states
- `components/ui/` — reusable interface controls
- `lib/use-local-storage.ts` — hydration-safe local persistence
- `next.config.ts` — static-export and optional base-path configuration
