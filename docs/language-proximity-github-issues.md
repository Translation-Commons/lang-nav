# Draft GitHub Issues: Language Proximity

## Issue 1: Add macrolanguage context banner to language detail pages

Add a clear banner or note on language detail pages when a language is a macrolanguage or has
constituent languages. This helps users understand that some entries represent groups and that more
specific language choices may be needed depending on use case.

Acceptance criteria:

- Banner only appears for macrolanguages or languages with constituents.
- Banner is concise.
- Banner links or jumps to contained languages section if available.
- Styling matches existing LangNav cards.

## Issue 2: Add related/contained languages widget

Create a reusable widget that displays contained languages, dialects, and related languages as
clickable cards or list items.

Acceptance criteria:

- Supports language name, code, optional speaker count, optional score.
- Uses existing LangNav links.
- Has empty/fallback state.
- Layout works on desktop and mobile.

## Issue 3: Investigate language proximity data ingestion

Review Jingyi's Language Proximity worksheet and current census TSV parser to determine how proximity
data should be loaded into LangNav.

Acceptance criteria:

- Document current TSV ingestion flow.
- Identify reusable parser/validation logic.
- Propose first data schema for proximity relationships.
- Identify minimum data needed for UI prototype.

## Issue 4: Prototype language comparison view

Design a simple comparison component for two languages showing written intelligibility, spoken
intelligibility, bilingualism, and notes or annotations.

Acceptance criteria:

- Avoid new dependencies unless approved.
- Prefer simple table/cards first.
- Leave room for source metadata and human annotations.

## Issue 5: Improve family tree display for large language hierarchies

Investigate how to improve the current family tree view when there are many branches or nested
relationships.

Acceptance criteria:

- Document current tree behavior.
- Suggest UI improvements.
- Consider collapse/expand, depth limiting, search/filter, and separate branch/language display.
