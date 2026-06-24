# Changelog

## 2.0.0 — Functional & security overhaul

### Security
- Removed the Mighty Networks API key from the client bundle (was exposed via `NEXT_PUBLIC_*`).
- Replaced the insecure `no-cors` "feed check" that authenticated every visitor.
- New server-side auth: `/api/auth/check`, `/api/auth/login`, `/api/auth/logout` with a signed `httpOnly` session cookie. No secrets reach the browser.
- `AUTH_MODE` (`disabled` | `dev` | `mighty`) for clean local dev and real production auth.

### Bug fixes
- Removed duplicate `<html>`/`<body>` in the charts layout (caused hydration errors); the root layout now owns them.
- Re-enabled TypeScript build checks (`ignoreBuildErrors` was hiding errors — the codebase is type-clean).
- Consolidated the duplicate `styles/globals.css` and removed extra lockfiles (`bun.lock`, `pnpm-lock.yaml`).
- Moved Gonero `@font-face` declarations into `globals.css` (the nested layout no longer renders `<head>`).

### Features
- Live market **ticker tape** across the top.
- Expanded **scanner** to 5 tabs: Crypto heatmap, Forex cross-rates, Stock heatmap, Markets quote board, Economic Calendar.
- Persisted UI preferences (active studies, panel visibility).
- Header **theme toggle** wired to the chart.

### UX / quality
- Responsive header (icon-only controls on mobile).
- Added README, `.env.example` and a ready-to-run dev `.env.local`.
- `npm run typecheck` script; cleaned `package.json` metadata.

## 1.0.0 — Standalone release
- Initial Charts Primeverse standalone extraction.
