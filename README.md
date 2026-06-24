# Prime Verse — Trading Platform

Professional multi-market technical-analysis platform built with **Next.js 15**, React 18, Tailwind CSS v4 and shadcn/ui. It bundles a TradingView-powered chart with custom studies, multi-market scanners/heatmaps, a live ticker tape, an economic calendar and a position-size calculator, behind an optional Prime Verse (Mighty Networks) access gate.

## Features

- **Advanced charting** — TradingView widget with Prime Verse studies (Freedom Zone, Direct Edge, Truth Signal, Liberty Point, Sovereign Sync), 60+ assets across forex, crypto, commodities, indices and stocks, saved charts, and per-chart theme/timeframe.
- **Live ticker tape** — real-time quotes for gold, BTC, ETH, major FX pairs and indices.
- **Multi-market scanners** — Crypto & Stock heatmaps, Forex cross-rates, a markets quote board and an economic calendar, all in one tabbed panel.
- **Position-size calculator** — risk-based lot sizing.
- **Theme toggle** — switch chart appearance from the header.
- **Persisted preferences** — selected studies and panel visibility are remembered.
- **Secure access gate** — server-side authentication with no secrets in the browser (see below).

## Quick start

```bash
npm install
cp .env.example .env.local   # a dev .env.local is already included
npm run dev
```

Open <http://localhost:3000>. The root page shows the Prime Verse splash, then redirects to `/charts-primeverse`.

> With the default `AUTH_MODE=dev`, the access gate always grants access so you can develop locally without a Mighty Networks session.

## Authentication

The old version shipped the Mighty Networks API key inside the client bundle and "authenticated" every visitor via a `no-cors` request that always succeeds. That has been replaced with a server-side design:

- The browser only ever calls our own `/api/auth/*` routes — **no secret ever reaches the client**.
- A signed, `httpOnly` session cookie issued on **our** domain is the source of truth, so the app no longer depends on cross-domain cookies from `mn.co` (which never worked).

`AUTH_MODE` selects the behaviour:

| Mode | Behaviour |
| --- | --- |
| `disabled` | App is fully public, no gate. |
| `dev` | Gate present but always grants access — for local development. |
| `mighty` | Real validation: a Mighty Networks member token is exchanged, server-side, for a signed session cookie. |

### Enabling real Mighty Networks auth (`mighty`)

1. Set in `.env.local`:
   ```env
   AUTH_MODE=mighty
   AUTH_SECRET=<openssl rand -hex 32>
   PRIMEVERSE_API_KEY=<your server-only MN API key>
   PRIMEVERSE_BASE_URL=https://prime-verse.mn.co
   ```
2. Configure Mighty Networks to redirect authenticated members to
   `https://<your-domain>/api/auth/login?token=<member-token>&return_to=/charts-primeverse`.
3. Adjust the single integration point — `validateMightyToken()` in `lib/auth.ts` — to match your MN plan's member-verification endpoint. Full SSO/JWT is a paid Mighty Networks feature; the function is isolated so you can swap in the exact call without touching the rest of the app.

## Project structure

```
app/
  layout.tsx                 # Root layout: <html>/<body>, ThemeProvider, fonts, Toaster
  page.tsx                   # Splash -> redirect to /charts-primeverse
  globals.css                # Tailwind v4 tokens + Gonero @font-face
  api/auth/                  # check | login | logout route handlers (server-side)
  charts-primeverse/
    layout.tsx               # Nested layout (no duplicate <html>/<body>)
    page.tsx                 # Main app: auth gate, header, widgets
components/
  trading-view-widget.tsx    # TradingView chart + studies + saved charts
  scanner-screener.tsx       # Multi-market heatmaps + economic calendar
  ticker-tape.tsx            # Live market ticker
  position-calculator-en.tsx # Position-size calculator
  ui/                        # shadcn/ui primitives
lib/auth.ts                  # Session signing/verification + MN validation
```

## Fonts

Brand fonts (Gonero) are declared in `app/globals.css`. Drop the `.woff2` files into `public/fonts/` to activate them; the app falls back to system fonts gracefully when they are absent.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (TypeScript errors now fail the build)
- `npm run start` — run the production build
- `npm run typecheck` — type-check without emitting
- `npm run lint` — lint

## Deployment

Deploy to Vercel (or any Node host). Set the environment variables from `.env.example` in the host's dashboard. In production, `AUTH_SECRET` is **required** and the session cookie is sent `Secure`.
