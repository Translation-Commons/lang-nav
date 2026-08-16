# lang-nav backend

A PostgreSQL schema and a Python ETL that loads the ~191 source files under
`public/data/` into it.

Today the browser downloads every one of those files and does the joining,
aggregating, filtering and sorting in JavaScript: roughly 144 HTTP requests,
78,000 rows and 100-125 MB of heap per page load. This directory is the
groundwork for moving that work to a database.

## Status

| Piece | State |
| --- | --- |
| `schema/001_schema.sql` | 36 tables, 14 enum types, 10 triggers, 1 view, 1 materialized view. Verified against a live PostgreSQL 18 server. |
| `schema/002_indexes.sql` | 74 indexes (120 total including constraint-backed ones), applied after loading |
| `etl/` | Loads all source files. Full run: 0 errors, 173 warnings. |
| Derive steps | **All of them run.** D1 to D11 plus D13; D12 was never a real step. Populations, synthesised locales, writing-system reach, depth, vitality and modality are filled |
| Coverage | Complete for the Combined tree. **Four steps answer for Combined only**, and one for ISO only - see below |
| Remaining gaps | Seven, each declared in `NOT_IMPLEMENTED` in `etl/derive.py` so that calling one raises instead of leaving a column silently NULL |

Every step is built. What is incomplete is **coverage across the seven
classification sources**, which matters because the whole point of the schema is
that the authorities disagree. Measured per source:

| Step | Combined | ISO / BCP / UNESCO / Glottolog / CLDR |
| --- | --- | --- |
| D7 `descendant_count` | 8,342 | **filled for all** (8,421 / 8,204 / 8,100 / 26,953 / 153) |
| D10 `depth` | 8,342 | **filled for all** (same counts) |
| D8 `population_estimate` | 7,635 | **0 - not implemented** |
| D11 `modality` | 1,028 | **0 - not implemented** |

D9 (largest descendant) and D10's vitality and coordinate half are Combined-only
for the same reason. D5's regional roll-up aggregates the ISO tree only.

**Why the gaps exist**, since none of them is an oversight:

- **D8 and D11 per source are deferred.** Both SQL functions already take a
  source parameter, so widening them is a call-site change. Nothing consumes a
  per-source language estimate until the API exposes one.
- **D9 per source is blocked, not deferred.** It ranks descendants by the
  estimates D8 writes, so it cannot run until D8 does.
- **D11 per source has no semantics to port.** The frontend function traverses
  the Combined child lists whatever source is selected, so the Combined answer
  is the only one the live site has ever produced. A Glottolog modality would be
  an invention and needs a maintainer's decision before it needs code.
- **D5 per source needs a schema decision.** It groups leaf locales by
  (language, script, variant) with no source dimension, so five copies of one
  family locale would sum into a single bucket.
- **The digital support score is a load gap, not a derive gap.** Three of its
  five inputs (`google/gtranslate.tsv`, `other_sources/ios.tsv`,
  `other_sources/win11_language_packs.tsv`) have no destination table, so a
  partial implementation would publish a score wrong by construction.

One further entry is a deliberate non-port: the frontend rewrites any child
population estimate at or above its parent's down to `parent - 0.01`. Q1 in
`schema/001_schema.sql` §0.2 says not to reproduce that, so our numbers
legitimately differ from the live site wherever it fires.

Loaded row counts:

| Table | Rows | | Table | Rows |
| --- | ---: | --- | --- | ---: |
| `entity` | 85,870 | | `entity_name` | 72,005 |
| `language` | 27,299 | | `language_source_attribute` | 60,173 |
| `locale` | 55,322 | | `language_ancestry` | 280,835 |
| `territory` | 289 | | `territory_ancestry` | 1,585 |
| `writing_system` | 225 | | `census` | 549 |
| `keyboard` | 2,001 | | `census_language_estimate` | 13,147 |

Measured after a full rebuild on 2026-08-15. `locale` counts both the ~10,800
curated rows and the ~23,400 regional ones D5 generates, so an earlier figure
of 10,860 was this table before D5 existed rather than a shrinking dataset.

Database size: about 199 MB, which still matches the sizing estimate that the
whole dataset fits comfortably in RAM on the smallest managed instance.

## Schema changes made during the first live execution

The schema had never been run against a real server. Three defects surfaced
immediately, and all three are fixed in `001_schema.sql`:

1. **A foreign-key cycle no COPY order can satisfy.**
   `language.primary_script_id` references `writing_system`, and
   `writing_system.primary_language_id` references `language`. Neither table
   can be loaded first. There are also four self-referencing keys whose success
   depended on parents happening to appear before children inside a source
   file. All foreign keys are now `DEFERRABLE INITIALLY IMMEDIATE` (see §10.7),
   and the ETL issues `SET CONSTRAINTS ALL DEFERRED` for the load transaction.
   Integrity is still fully enforced, just once at COMMIT.

2. **The `locale` uniqueness rule rejected seven real locales.**
   `UNIQUE (language_id, script_id, territory_id, locale_source)` cannot see
   variants, which live in `locale_variant`. Romansh has seven
   variant-distinguished locales in Switzerland (Sursilvan, Vallader, Puter,
   Surmiran, Sutsilvan, Jauer, Rumantsch Grischun) plus plain `roh_CH`, and all
   eight share that tuple. A `variant_key` column was added and included in the
   constraint.

3. **`data_quality_finding.entity_id` was `NOT NULL`.**
   Many findings are about a file or a whole source rather than an entity
   ("this file produced zero rows", "180 constituents are not known
   languages"). The column is now nullable.

Verified afterwards with `EXPLAIN (ANALYZE, BUFFERS)`: the headline query
(`locale` by territory, ordered by speakers) uses
`Index Only Scan using locale_by_territory_pop_idx` with `Heap Fetches: 0`,
confirming the `INCLUDE` columns do their job.

The derived population columns being NULL is deliberate and visible: calling
any unimplemented step raises `DeriveStepNotImplemented` rather than quietly
leaving a column empty for a caller to misread as zero.

## Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # then fill in the two passwords
```

`.env` is gitignored. It holds two connections: a bootstrap superuser used once
to create the database, and the application role used for every run after that.

## Running it

```bash
python scripts/bootstrap_database.py          # dry run, shows what it would do
python scripts/bootstrap_database.py --apply  # create the database and role

python -m etl.run --all                       # schema, load, indexes
python -m etl.run --verify                    # golden-value checks, read-only
python -m etl.run --extract-only              # parse every file, no database
python -m etl.run --roles                     # API grants only, no reload
```

`--extract-only` needs no database at all. It is the fastest way to check
whether a source file has changed shape.

### Re-running a load

`--load` refuses to run against a non-empty database. To reload you must pass
`--fresh`, which **truncates every ETL-owned table**. That is a destructive
operation and is deliberately not the default.

## The read-only API (optional)

Phase 0 of the backend migration serves this database over HTTP with
[PostgREST](https://postgrest.org). It is entirely optional: the ETL neither
needs nor notices it, and an installation that skips this section runs normally.

PostgREST does not connect as the role whose privileges it uses. It logs in as
one role and `SET ROLE`s to another for each request, so this needs two:

| Role | | |
| --- | --- | --- |
| `langnav_read` | `NOLOGIN` | holds every `SELECT` grant. PostgREST's `db-anon-role` |
| `langnav_authenticator` | `LOGIN NOINHERIT` | what connects. Owns nothing, reads nothing until it assumes `langnav_read` |

`NOINHERIT` is the point: the authenticator carries no privilege of its own, so
a leaked connection string is not a standing read on the schema.

```bash
# 1. Put a password for the authenticator in .env
#    LANGNAV_AUTHENTICATOR_PASSWORD=...

# 2. Create the two roles. Needs the superuser, because roles are cluster-level
#    and the application role is deliberately NOCREATEROLE.
python scripts/bootstrap_database.py --api-roles          # dry run
python scripts/bootstrap_database.py --api-roles --apply

# 3. Apply the grants. --schema and --load do this too; --roles is the way to
#    re-apply them on their own.
python -m etl.run --roles
```

Then download the PostgREST binary for your platform from
[its releases page](https://github.com/PostgREST/postgrest/releases) into
`backend/tools/` (gitignored), and generate its config from `.env`:

```bash
python scripts/write_postgrest_config.py
tools/postgrest tools/postgrest.conf
```

The config is generated rather than hand-written because it embeds a password,
so it cannot be committed and every installation has to produce its own. It
carries two settings worth knowing about, both defaulted for a local developer:

- **`server-cors-allowed-origins`** defaults to `http://localhost:5173` and
  `http://localhost:4173`, which are `npm run dev` and `npm run preview`. **A
  deployment must set `LANGNAV_API_CORS_ORIGINS` to the real site origin**; an
  empty value makes PostgREST allow any origin at all.
- **`db-max-rows`** defaults to 100000, which is deliberately ABOVE the largest
  table rather than a comfortable page size. A capped response is
  indistinguishable from a complete one - `Content-Range` reports `0-99999/*`,
  with a literal asterisk for the total - so a cap that can actually be reached
  would silently truncate the data. Lowering it requires the loaders to detect
  truncation first, for which `Prefer: count=planned` makes `Content-Range`
  report the real total at no measurable cost.

`backend/tools/` is gitignored in full, because `postgrest.conf` contains a
database password and the binary does not belong in git either.

Three endpoints worth trying first:

```bash
curl "http://localhost:3000/territory?id=eq.IN"
curl "http://localhost:3000/locale?territory_id=eq.IN&order=pop_speaking_adjusted.desc.nullslast&limit=20"
curl "http://localhost:3000/entity_name?entity_type=eq.Language&name=ilike.tam*"
```

**`order=...desc` alone puts NULLs FIRST**, which is almost never what a
population sort wants. Write `desc.nullslast` explicitly, as the second example
does. This is the same trap the schema's `DESC NULLS LAST` indexes exist for.

### Deploying it: compression is required, not optional

**PostgREST cannot compress. There is no setting for it** - `--dump-config` in
16.1 offers only cors, host, port and socket options. Whatever sits in front of
it in a deployment must do the compressing.

This does not matter on localhost and that is the trap. Measured on loopback,
the realistic `language` query takes 1.12 s of which 1.03 s is time-to-first-byte,
so the transfer is about 10 ms and the cost is the server building the response.
Development will never notice. Over a real link:

| Response | Raw | Gzipped | 4G, 20 Mbit raw | gzipped |
| --- | ---: | ---: | ---: | ---: |
| `territory`, all 289 | 148 KB | 23 KB | 0.06 s | 0.01 s |
| `language`, realistic | **12.9 MB** | 906 KB | **5.2 s** | 0.4 s |
| `locale`, realistic | **13.9 MB** | 1.0 MB | **5.6 s** | 0.4 s |

Compression is worth **13 to 14x**, because JSON repeats every key on every one
of 27,299 or 55,322 rows and that is precisely what a compressor removes.

```nginx
gzip on;
gzip_types application/json;
gzip_min_length 1024;
```

Caddy and Cloudflare do it by default. Confirm with:

```bash
curl -s -I -H "Accept-Encoding: gzip" "<your-api>/language?select=id" | grep -i content-encoding
```

If that prints nothing, compression is not happening.

Two related habits, in the same spirit:

- **Select only the columns the caller parses.** `language?select=*` is 28.4 MB
  against 12.9 MB for the columns a loader actually reads.
- **Do not switch to CSV to save bytes.** It is 7.3x smaller than JSON
  uncompressed but only 13% smaller gzipped, and embedded resources degrade into
  JSON strings inside CSV cells.

> `postgrest --dump-config` prints `db-uri` **including the password**. Do not
> paste its output anywhere.

### What the API role can and cannot do

Verified by running the statements, not by reading the grants:

- `SELECT` on all 36 tables, the view and the materialized view
- `INSERT`, `UPDATE`, `DELETE` and `TRUNCATE` are all refused
- the 21 project functions are **not** executable. Postgres grants `EXECUTE` to
  `PUBLIC` by default and PostgREST publishes anything executable as
  `POST /rpc/<name>`, so `005_roles.sql` revokes them - otherwise the whole
  derive chain would be a set of public endpoints. The `pg_trgm` functions keep
  theirs, because the `ilike` search uses the trigram index.

## Isolation

`bootstrap_database.py` runs with superuser credentials on a server that may
host unrelated databases, so it is written to be narrow:

- it only ever `CREATE`s, with no `DROP`, no `TRUNCATE` and no force path
- it refuses to touch any database other than `LANGNAV_DB`, and refuses
  outright if that name is a system database
- if the target database already exists it reports and stops
- the role it creates is `NOSUPERUSER NOCREATEDB NOCREATEROLE`, so the ETL
  credentials cannot reach any other database
- it prints the database list before and after, so "nothing else was touched"
  is verifiable rather than asserted

One honest caveat about the role. PostgreSQL grants `CONNECT` on every database
to `PUBLIC` by default, so `langnav_admin` **can** open a connection to other
databases on the same server and read the system catalogs, which means it can
see table *names*. It cannot read any data: verified on this machine against
two unrelated databases, where every `SELECT` was refused at the schema level
and the role held `SELECT` on zero tables. To close even the connection, an
administrator would have to
`REVOKE CONNECT ON DATABASE <other> FROM PUBLIC`, which affects that database's
other users and is therefore not something this script does.

## How it is put together

```
source files -> extractors -> in-memory merge -> COPY -> derive
```

Extractors do not write to the database. They write into a dict keyed by each
table's natural primary key, because several files feed the same table:
`territory` is assembled from five, `language_source_attribute` from seven.
Merging in memory makes that a hash lookup per row instead of an `UPDATE` per
row per file, and each table is then written with a single
`COPY ... FROM STDIN`.

Foreign keys are checked in Python before the load. Postgres aborts on the
first violation, so letting it do the checking would tell you about one bad row
per run. Checking first reports every offender in one pass: a nullable key that
does not resolve is set to NULL with a warning, a required one takes its row
with it as an error. Everything found is written to `data_quality_finding`
against the run's `run_id`, and the process exits non-zero if any error-level
finding was recorded.

| Module | Responsibility |
| --- | --- |
| `etl/config.py` | `.env` loading, connection targets, paths |
| `etl/sources.py` | File readers and value coercion (commas, percents, `#` blocks, the IANA format) |
| `etl/registry.py` | Table specs, the merge layer, FK resolution, findings |
| `etl/db.py` | Connections, `COPY`, object counts |
| `etl/loaders/` | One module per source group, run in dependency order |
| `etl/derive.py` | Closure rebuilds, matview refresh, stubs for the rest |
| `etl/run.py` | CLI orchestrator and the golden-value checks |

## Tests

```bash
python -m pytest
```

63 tests covering the readers, the merge semantics and the trickier extractors.
They need no database. Every case is a hazard that actually occurs in the
source data rather than a hypothetical.

## Things the source data will tell you

Findings the loader reports on a clean run, all of which are real and none of
which are loader bugs:

- **Ethnologue loads zero rows.** `sil/ethnologue2012.tsv` and
  `ethnologue2025.tsv` are header-only in this repository, so one of the seven
  authorities is unpopulated. UNESCO is fine: it has no file of its own by
  design and is seeded from `languages.tsv` for codes of three characters or
  fewer.
- **`wikipedias.tsv` uses a status the schema cannot store.** `Deleted` is not
  in the `wikipedia_status` enum (`Active`, `Closed`, `Incubator`).
- **Three files have no target table:** `google/gtranslate.tsv`,
  `other_sources/ios.tsv` and `other_sources/win11_language_packs.tsv` describe
  per-platform digital support, which the schema does not model.
- **`language` is larger than 8,208.** It is the union of every authority's
  languoids, and Glottolog alone contributes about 27,000 nodes. `source_ref`
  records which file first created each row, so the documented figure stays
  checkable:
  `SELECT count(*) FROM language WHERE source_ref = 'languages.tsv';`
- **32 `cldrCoverage.tsv` rows key on a locale tag** (`hi_Latn`, `zh_Hant`)
  rather than a language, and cannot be stored in a table keyed by
  `language_id`.
- **`cmn_TW` is listed twice in `locales.tsv`** (line 204). The two rows were
  merged.
- **`locales.tsv` line 9135 has `2,521` in the Population Source column**,
  which is a misaligned row rather than a source name.
- **25 duplicate Wikipedia subdomains** in `wikipedias.tsv`.
- **One glottocode maps to two different languages**, which is exactly the
  situation `language_code_alias`'s key on `(alias_code, alias_kind)` exists to
  prevent.

All of these are recorded in `data_quality_finding` with the run's `run_id`:

```sql
SELECT severity, field, count(*)
  FROM data_quality_finding GROUP BY 1, 2 ORDER BY 3 DESC;
```
