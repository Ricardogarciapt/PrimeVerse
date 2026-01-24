# Installation Guide - Charts Primeverse Standalone

## Quick Start

1. **Copy the entire folder structure** to your Next.js project root
2. **Install dependencies**: `npm install lucide-react`
3. **Update authentication URLs** in `app/charts-primeverse/page.tsx`:
   \`\`\`typescript
   const PRIMEVERSE_LOGIN_URL = "https://prime-verse.mn.co/sign_in?from=..."
   const PRIMEVERSE_BASE_URL = "https://prime-verse.mn.co"
   \`\`\`
4. **Add Gonero fonts** to `public/fonts/` or update font paths in `layout.tsx`
5. **Access** at `/charts-primeverse`

## File Structure

\`\`\`
CHARTS-PRIMEVERSE/
├── app/
│   └── charts-primeverse/
│       ├── layout.tsx      # Standalone layout with Gonero fonts
│       └── page.tsx        # Main page component
├── components/
│   └── trading-view-widget.tsx    # TradingView integration
└── README.md               # Full documentation
\`\`\`

## Important Notes

- All references to "MTM" and "MoreThanMoney" have been removed
- Prime Verse color palette: #015BF9, #FFFFFF, #040507, #1200DE, #EDECED
- Available studies: GoldenZone, Momentum, Winzone, Nexus, Sinergy
- KillShot, Supernova, and Smartmonics are excluded
- Imports use relative paths (can be changed to `@/` if you have path aliases)
- No dependencies on MoreThanMoney codebase

## Customization

- Update colors in `page.tsx` (PRIMEVERSE_COLORS constant)
- Update authentication URLs
- Modify available studies in `page.tsx` (availableStudies array)
- Add/update Gonero font files
