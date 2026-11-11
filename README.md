# FAAC VAT dashboard

Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui (new-york, zinc) + Recharts.
Data: `src/data/vat_corrected_wide.csv` (36 states, monthly, naira), parsed at build time in `src/lib/data.ts`.

```bash
bun install   # or npm install
bun run dev
bun run build
```

- `src/components/ui/*` are the shadcn components (card, badge, button, tabs, select, table, chart).
- `src/components/hero.tsx` is the top of the page: KPIs, clickable map, trend, ranked list, annual and zone charts. One shared selection (state, year) drives everything; click the map, the list or a bar.
- `src/components/sections.tsx` holds the deeper analysis (state analysis, zones, timing) and shared chart helpers.
- `src/components/nigeria-map.tsx` + `src/data/ng-states.json`: choropleth. Boundaries are Natural Earth (public domain), projected to SVG by `scripts/make-geo.py`. FCT is drawn hatched because the CSV has no FCT column.
- Zones are the six standard geopolitical zones (`ZONES` in `src/lib/data.ts`). FCT is not in the CSV.
- To use the shadcn CLI for more components: `bunx shadcn@latest add dialog` (`components.json` is already set up).
- To swap data, replace the CSV (same wide layout: `Date` + one column per state).
