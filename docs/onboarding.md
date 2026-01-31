# Onboarding Guide

This is a short, practical path to get productive in Lang Navigator.

## Quick start

1. Install a recent edition Node.js and npm.
2. Clone the repo and run `npm install` to download the relevant packages.
3. Run `npm run dev` to start Vite; open the logged localhost URL (defaults to <http://localhost:5173/>).
4. Run checks before you ship: `npm run test`, `npm run build`.

## Common commands

- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test`
  - Compute test coverage `npm run test:coverage`

## Repository map (feature-sliced)

- `src/app/`: app root, providers, router entry.
- `src/pages/`: page-level views (Languages, Locales, Tables, Reports, etc.).
- `src/widgets/`: UI building blocks (navigation, details sections, tables, reports, path navigation).
- `src/features/`: reusable features like data loading/compute, map, table, pagination, filters.
- `src/entities/`: domain-specific UI and helpers for languages, locales, territories, writing systems, variants, censuses.
- `src/shared/`: cross-cutting hooks, UI primitives, and utilities.
- `public/data/`: primary TSV datasets; images live in `public/`.
- `src/fileOrganization.md`: reference for the folder conventions.

## Data flow

1. Load TSV/CSV/JSON data via `src/features/data/load/`.
2. Connect relationships and synthesize new entities in `src/features/data/connect/`.
3. Compute derived metrics (populations, containment stats, etc.) in `src/features/data/compute/`.
4. Expose everything through the data context in `src/features/data/context/` for the UI to consume.

## First contribution ideas

- Scan through [the github issues](https://github.com/Translation-Commons/lang-nav/issues) and find one labeled "[good first issue](https://github.com/Translation-Commons/lang-nav/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)"
- Create your own issue for a bug or improvement you'd like to see. Some ideas are:
  - Fix a UI detail (copy, spacing, hover text) in `src/widgets/` or `src/entities/`.
  - Add a small TSV correction in `public/data/`.
  - Add a missing test in `src/tests/` for a data transform or component.

## Troubleshooting

- Module imports use aliases (e.g., `@features/...`); if IDE complains, ensure it picks up `tsconfig.json`.
- If data changes fail builds, start from the load step and confirm headers/encodings of the TSVs.
- Vitest/Testing Library tests rely on `src/tests/setupTests.ts` for DOM globals.
- Often, just follow what existing code in the repository does for similar features or data management.
- Generative AI tools are a blessing and a curse; always double-check any code they produce. When in particularly new territory, ask the GenAI models to explain the concept that they are writing for you or to forward you to software engineering blogs to learn more.
