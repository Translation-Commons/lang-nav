# Language Proximity / Related Languages Workstream

## Goal

Represent macrolanguages, dialects, contained languages, related languages, and intelligibility
relationships in LangNav so users can choose the right language or variety for their context.

## Meeting Context

- Revive the language proximity workstream.
- Coordinate with Jun/Wonjoon and Jingyi.
- Show Jingyi's Language Proximity dataset in LangNav.
- Think through both UI and data model.
- Use GitHub issues to keep work reviewable.
- Make incremental changes instead of a large redesign.

## Current Data Flow

Spreadsheet -> TSV -> parser -> connected objects -> computed objects -> website.

Core TSV files live in `public/data/`. Main language objects are loaded from
`public/data/tc/languages.tsv` by `src/features/data/load/entities/loadLanguages.ts`.
Supplemental ISO and Glottolog data is loaded from `src/features/data/load/extra_entities/`.
Parent/child language links are connected in `src/features/data/connect/connectLanguagesToParent.ts`.

Census data follows the same broad pattern. Census TSV files are listed in `censusList.txt` files,
loaded by `src/features/data/load/extra_entities/loadCensusData.tsx`, parsed with
`parseCensusMetadata`, and then language rows are parsed with `parseCensusLanguageRow`.

## Current Challenges

- Macrolanguage vs language vs dialect is not always obvious to users.
- ISO codes may not exist for some varieties.
- The same ISO code can map to different dialect or catalog codes.
- Family tree views can become too tall or hard to follow.
- Users need context to choose the right language for speech, writing, localization, or research.
- Written and spoken intelligibility can differ significantly.

## Proposed UI

- Macrolanguage context banner.
- Contained languages section.
- Related languages widget.
- Dialect section.
- Intelligibility/comparison view.
- Optional map, tree, and radar chart explorations later.

## First Milestone

- Add a macrolanguage or language-group banner.
- Add a related/contained languages widget.
- Use existing fields such as `scope`, `childLanguages`, and CLDR language matches first.
- Avoid a large data model refactor.

## Future Milestones

- Load Jingyi's Language Proximity dataset.
- Generalize TSV validation utilities where reusable.
- Add comparison page/details.
- Improve tree/map views for large hierarchies.
- Support annotations and source metadata.

## Proposed First Data Model

Start with a relationship table that can be loaded independently from core language definitions:

| Field                    | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `sourceLanguageCode`     | LangNav language, ISO code, or Glottocode for the first language.   |
| `targetLanguageCode`     | LangNav language, ISO code, or Glottocode for the related language. |
| `relationshipType`       | `contained`, `dialect`, `related`, `intelligible_with`, or similar. |
| `writtenIntelligibility` | Optional numeric score or category.                                 |
| `spokenIntelligibility`  | Optional numeric score or category.                                 |
| `bilingualism`           | Optional numeric score or category.                                 |
| `lexicalSimilarity`      | Optional numeric score or category.                                 |
| `notes`                  | Human-readable explanation or annotation.                           |
| `source`                 | Citation, worksheet name, or source URL.                            |

This can be refined after reviewing Jingyi's worksheet columns.

## Relevant Files

- `src/widgets/details/LanguageDetails.tsx`
- `src/widgets/details/sections/LanguageConnections.tsx`
- `src/entities/language/LanguageTypes.ts`
- `src/features/data/load/entities/loadLanguages.ts`
- `src/features/data/load/extra_entities/ISOData.tsx`
- `src/features/data/load/extra_entities/GlottologData.tsx`
- `src/features/data/connect/connectLanguagesToParent.ts`
- `src/features/data/load/extra_entities/loadCensusData.tsx`
- `src/entities/census/parseCensusMetadata.ts`
- `src/entities/census/parseCensusLanguageRow.ts`
- `public/data/tc/languages.tsv`
- `public/data/iso/macrolanguages.tsv`
- `public/data/glottolog/glottolog.tsv`
- `public/data/census/`

## Open Questions

- Should contained languages appear near the top or bottom?
- Should branches be visually separated from languages?
- Should a radar chart be used, or is a table clearer?
- What exact fields from Jingyi's worksheet should become first-class data?
- Should map auto-zoom show constituents by default?
- How should we represent a family containing a macrolanguage that contains another family?
