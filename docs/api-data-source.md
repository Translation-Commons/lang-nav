# Loading data from the API

Lang Navigator loads its data from the ~191 TSV files in `public/data`. A
migration is underway to serve that same data from a PostgreSQL database instead
(see `backend/README.md`), and this page describes the switch that chooses
between the two.

**Nothing here is required to work on the app.** With `VITE_API_URL` unset, the
app loads every entity from files, which is what it has always done and what
production does today.

## The switch

```bash
# .env
VITE_API_URL=http://localhost:3000
```

Read by `src/features/data/load/api/apiConfig.ts`. Unset means files.

## What has moved so far

| Entity          | Source when `VITE_API_URL` is set |
| --------------- | --------------------------------- |
| Territories     | API, one request                  |
| Writing systems | API, one request                  |
| Everything else | still TSV files                   |

Territories were first because they are small (289 rows), self-contained, and
exercise the awkward parts: natural text primary keys, two self-referencing
hierarchies, and names spread across several tables.

**Five requests become one.** The ETL merged `territories.tsv`,
`territories_gdp_literacy.tsv`, `country-coord.csv`, `country_land_area.tsv` and
`territory_names.tsv` into the `territory` table plus `entity_name`, so
`SupplementalData.tsx` skips the four supplemental territory loaders when the
API is enabled. That skip, not the swap in `loadTerritories`, is where the
saving actually is.

Writing systems are also one request, including their grouping relation
(`writing_system_contains`, e.g. Jpan contains Hani + Hira + Kana) — embedded via
PostgREST rather than fetched separately, so Postgres does that join instead
of the browser. The junction table has two foreign keys to `writing_system`,
so the embed needs a disambiguation hint naming the exact constraint:
`writing_system_contains!writing_system_contains_parent_id_fkey(child_id)`.

Two parity quirks worth knowing before touching this mapping: `nameDisplayOriginal`
is set to the same value as `nameDisplay` rather than read from its own
column, because the ETL never writes to `writing_system.name_display_original`
even though it exists; and the `names` array uses `!= null` rather than a
truthy filter, so it would keep an empty string rather than drop it.

**`loadWritingSystems` falls back to the TSV file if the API call fails;
Territory, Language and Locale currently do not** - they return the API
loader's `undefined` straight through, which surfaces as `CoreData.tsx`'s
blocking "Error loading data" alert. This is deliberate here, not an
oversight: building exactly this recovery path was the original goal of the
migration's Phase 0. Whether every entity should eventually get it is an open
question for the team, not something this file resolves.

## The rule the loaders follow

**The API changes where data comes from, not who computes it.**

The database also holds DERIVED values - the ETL's D3 step rolls child
territories up into their parents, exactly as `computeContainedTerritoryStats`
does in the browser. Those derived values are deliberately NOT sent to the app,
and the reason is worth knowing before adding a field:

`computeContainedTerritoryStats` assigns three of them with `??=`
(`computeTerritoryStats.ts:25,28,33`). A value that is already present therefore
**blocks** the browser's computation instead of being replaced by it. Sending a
pre-computed figure would make the two agree only for as long as the database
and the browser agree, and the day they diverge the browser would silently defer
to the database with nothing to show that it had.

So `loadTerritoriesFromApi` sends the raw figures and withholds the derived
ones:

- `population_from_un`, not the rolled-up `population`
- for the 32 group territories, no literacy, gdp, land area or coordinates

Leaf territories are unaffected: their values come from the source files, not
from the roll-up.

The same trap exists on writing systems, though only one of the two fields is
actually vulnerable to it. `population_upper_bound` and
`population_of_descendants` are both computed by the ETL's D7 step, and
separately, in the browser. Two places accumulate into `populationUpperBound`
with the dangerous shape - `+=` behind an `if (!x)` guard: `connectWritingSystems.ts`
from language data, and `connectLocales.ts` from locale data. A value already
present from the API would not be reset to 0 first in either one, so either
would double-count on top of it.
`computeDescendantPopulation.ts` assigns `populationOfDescendants` with a plain
`=`, so sending it would just get overwritten harmlessly - `loadWritingSystemsFromApi`
withholds it anyway, for the same reason `loadTerritoriesFromApi` withholds
every derived figure on group territories: the API should describe where data
comes from, not carry a value only one of the two paths would end up owning.

## Verifying a change

The mapping has unit tests that need no network
(`src/features/data/load/api/__tests__/loadTerritoriesFromApi.test.ts`).

Those cannot tell you whether the API path AGREES with the file path, which is
the question that matters. For that,
`src/features/data/load/api/__tests__/loadTerritoriesParity.test.ts` loads
both and compares every field of all 289 territories. Do not spot-check: the
differences found while building this were on 2, 6 and 30 territories
respectively, and every one of them would have survived a handful of samples.

The parity test needs a running backend, so it only runs when `VITE_API_URL`
is both set and reachable - unset, or set with the backend stopped, it skips
itself rather than failing. Start PostgREST (see `backend/README.md`) and run
`npm run test` to exercise it for real.

The same two-layer approach applies to writing systems - see
`loadWritingSystemsFromApi.test.ts` and `loadWritingSystemsParity.test.ts`.
