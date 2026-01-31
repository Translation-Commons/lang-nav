# Architecture Overview

Lang Navigator is a React + TypeScript single-page app powered by Vite, organized with a feature-sliced structure.

## High-level layout

- `src/app/`: root App component, global providers, routing.
- `src/pages/`: top-level views that compose widgets and entity components for specific routes.
- `src/widgets/`: UI sections reused across pages (navigation, detail sections, tables, reports, tree/path nav).
- `src/features/`: cross-cutting features (data load/compute, map layers, pagination, params, treelist).
- `src/entities/`: domain-specific UI and helpers for languages, locales, territories, writing systems, variants, censuses.
- `src/shared/`: utilities, hooks, and UI primitives used everywhere.
- Aliases (e.g., `@entities/...`, `@features/...`) replace long relative paths; see `tsconfig.json` and `src/fileOrganization.md`.

## Data pipeline

Core data files live in `public/data/` and are usually stored as Tab-separated value (`tsv`) files.

The data layer lives in `src/features/data/` and follows the flow documented in `src/features/data/readme.md`:

1. **Load** TSV/CSV/JSON sources in `load/` (main entities plus supplemental data such as ISO retirements).
2. **Connect** relationships in `connect/` (link parents/children, generate regional locales, wire writing systems).
3. **Compute** derived values in `compute/` (population rollups, contained territory stats, locale computations).
4. **Context**: expose loaded/connected/computed data through providers/hooks in `context/` for UI consumption.
   Core data files live in `public/data/`; UI surfaces pull from the context rather than reading files directly.

## UI composition

- Pages assemble widgets and entity-specific components; widgets remain presentation-focused while features handle logic.
- Entity folders contain both UI and helpers tailored to the domain (e.g., `src/entities/language/`, `src/entities/locale/`).
- Navigation and hierarchical browsing live in `src/widgets/pathnav/` and tree/list widgets in `src/widgets/treelists/`.
- Reports and tables live under `src/widgets/reports/` and `src/widgets/tables/` with supporting features in `src/features/table/`.

## Testing approach

- Vitest + React Testing Library; shared setup is in `src/tests/setupTests.ts`.
- Prefer unit tests for data loaders/transforms and component tests for critical widgets and entity views.
- Mock server/test utilities live in `src/tests/testServer.ts` and `src/tests/polyfills/`.

## Styles and conventions

- Prettier and ESLint enforce formatting and import rules; run `npm run lint` to check.
- Keep components small, domain-aligned, and colocated with related helpers.
- Favor descriptive types and module aliases; add comments only where intent is non-obvious.
