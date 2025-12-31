# Contributing to Language Navigator

Thanks for your interest in contributing to Language Navigator! We welcome contributions from the community to help improve our dataset and website.

## Ways to help
- File issues for bugs, data corrections, and ideas. Include repro steps, links to the affected language/locale, and screenshots when relevant.
- Improve data quality by editing TSVs in `public/data/` (small fixes) or extending loaders in `src/features/data/load/` (bigger changes).
- Add or refine UI components, reports, and other widgets.

## Local setup
1) Install recent Node.js + npm packages (the project is built with Vite and TypeScript).  
2) Clone the repo.
3) `npm install`  
4) `npm run dev` and open the printed localhost URL (defaults to `5173`).  
5) Run checks before sending a PR:
   - `npm run lint`
   - `npm run test`
   - `npm run build` (type-checks via `tsc -b` and builds)

## Workflow
- Branch from `main` and keep PRs focused; include a short summary of scope and motivation.
- If you change UI behavior, add before/after screenshots or a brief clip.
- Update docs when changing behavior, data formats, or commands.

## Code style
- TypeScript + React; prefer functional components and hooks.
- Linting/formatting: follow the repo Prettier rules (single quotes, trailing commas, 100 char width). It should auto-format on save in VSCode, otherwise run `npm run lint` to fix issues.
- When importing classes, prefer module aliases (`@entities/...`, `@features/...`, etc.) and follow the feature-sliced layout described in [/src/fileOrganization.md](/src/fileOrganization.md).
- Components live with their domain: entities in `src/entities/`, shared UI in `src/shared/ui/`, widgets in `src/widgets/`, pages in `src/pages/`.
- Keep functions small (<40 lines) and files manageable (<200 lines). Split complex logic into smaller helpers in the same folder.
- Name functions and variables descriptively; avoid abbreviations. For example `getLanguageDisplayNames()` is better than `getLang()`.

## Data changes

There's a lot of data shown here but there always could be more. The main way to add or update data is to go to the Tab-separated files directly. They are all in the [public/data](/public/data) directory.

If you want to add entries or update values, you can just edit the existing TSVs.

However, if you want to add a lot more data or add contested data it may be better to make new TSVs and then update the data loads in `src/features/data/load/` and connectors/computations in `src/features/data/connect/` and `src/features/data/compute/`.

Always cite your sources and avoid using proprietary data without permission.

## Pull request checklist
A checklist is provided automatically when you create a pull request with [PULL_REQUEST_TEMPLATE.md](/.github/PULL_REQUEST_TEMPLATE.md).