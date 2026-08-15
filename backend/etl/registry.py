"""The in-memory merge layer.

This is the core of the "direct load" design. Extractors do not write to the
database; they write here. Several source files feed the same table (territory
alone is assembled from four), so rows are accumulated in a dict keyed by the
table's natural primary key and merged column by column.

Why a dict rather than issuing UPDATE statements per file:
a naive multi-file merge does one UPDATE per row per contributing file, which
for territory alone is roughly 1,100 round trips. Merging in memory makes it a
hash lookup per row, O(1) each and O(n) overall, and the table is then written
with a single COPY.

Memory cost is modest: the full dataset is roughly 78,000 rows of mostly short
strings, and each table is released as soon as it has been copied.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable

# Foreign keys are resolved in Python before the load rather than being left to
# Postgres, for one reason: Postgres aborts on the first violation, so you learn
# about one bad row per run. Checking here reports every offender in a single
# pass, which is what makes a first execution against real data useful.
Fk = tuple[str, str, bool]  # (column, target_table, nullable)


@dataclass
class Finding:
    """One data-quality problem, destined for the data_quality_finding table."""

    entity_id: str | None
    field: str
    severity: str  # info | warning | error
    message: str

    def as_row(self, run_id: str) -> tuple:
        return (self.entity_id, self.field, self.severity, self.message, run_id)


@dataclass
class Table:
    """One target table's accumulated rows."""

    name: str
    columns: tuple[str, ...]
    pk: tuple[str, ...]
    fks: tuple[Fk, ...] = ()
    defaults: dict[str, Any] = field(default_factory=dict)
    rows: dict[tuple, dict[str, Any]] = field(default_factory=dict)
    # (key, column, previous value, new value) for every disagreeing overwrite.
    _conflicts: list[tuple] = field(default_factory=list)

    def key_of(self, values: dict[str, Any]) -> tuple:
        return tuple(values[c] for c in self.pk)

    def upsert(self, _override: bool = False, **values: Any) -> dict[str, Any]:
        """Merge values into the row with this primary key.

        A None never overwrites a real value, so a later file can fill in
        columns an earlier one left blank without clobbering anything.
        Conflicting non-null values are recorded rather than silently dropped.

        _override=True marks a DELIBERATE refinement rather than a
        disagreement, and suppresses the conflict record. Use it only where a
        later, more authoritative file is expected to replace an earlier value:
        the ISO family files refining a parent that languages.tsv guessed, or
        BCP preferring the two-letter code over the three-letter one. Without
        this distinction the genuine conflicts drown in thousands of intended
        ones.
        """
        unknown = set(values) - set(self.columns)
        if unknown:
            raise KeyError(f"{self.name}: unknown column(s) {sorted(unknown)}")

        key = self.key_of(values)
        row = self.rows.get(key)
        if row is None:
            row = {c: None for c in self.columns}
            self.rows[key] = row

        for col, val in values.items():
            if val is None:
                continue
            existing = row[col]
            if (
                not _override
                and existing is not None
                and existing != val
                and col not in self.pk
            ):
                self._conflicts.append((key, col, existing, val))
            row[col] = val
        return row

    def ids(self) -> set:
        """The set of primary key values, for FK checking on single-column PKs."""
        if len(self.pk) != 1:
            raise ValueError(f"{self.name} has a composite primary key")
        return {k[0] for k in self.rows}

    def tuples(self) -> Iterable[tuple]:
        """Rows as tuples, with NOT NULL defaults filled in.

        Columns that are NOT NULL DEFAULT <x> in the schema are left as None
        in memory so that "not set by any file" stays distinguishable from
        "explicitly set to the default value". The default is substituted here,
        at the boundary, rather than being written by whichever loader happens
        to touch the row first.
        """
        defaults = self.defaults
        for row in self.rows.values():
            yield tuple(
                defaults[c] if row[c] is None and c in defaults else row[c]
                for c in self.columns
            )

    def __len__(self) -> int:
        return len(self.rows)


class Dataset:
    """Every target table, plus the findings gathered while building them."""

    def __init__(self) -> None:
        self.tables: dict[str, Table] = {}
        self.findings: list[Finding] = []
        # Files that have no target table in the current schema. Recorded
        # explicitly so that "we did not load this" is a reported fact rather
        # than a silent omission.
        self.unmapped_files: list[tuple[str, str]] = []
        for spec in TABLE_SPECS:
            self.tables[spec.name] = Table(
                name=spec.name,
                columns=spec.columns,
                pk=spec.pk,
                fks=spec.fks,
                defaults=dict(spec.defaults),
            )

    def __getitem__(self, name: str) -> Table:
        return self.tables[name]

    def warn(self, entity_id: str | None, field_name: str, message: str) -> None:
        self.findings.append(Finding(entity_id, field_name, "warning", message))

    def error(self, entity_id: str | None, field_name: str, message: str) -> None:
        self.findings.append(Finding(entity_id, field_name, "error", message))

    def note_unmapped(self, path: str, reason: str) -> None:
        self.unmapped_files.append((path, reason))

    # -- entity helpers -----------------------------------------------------

    def register_entity(
        self,
        entity_id: str,
        entity_type: str,
        code_display: str | None = None,
        name_display: str | None = None,
        name_endonym: str | None = None,
    ) -> None:
        """Every id in the system must exist in `entity` before its own table.

        name_display is NOT NULL in the schema, so it falls back to the id.

        FIRST WRITER WINS for the display name. Loaders run in authority order
        (curated tc/ files before ISO before Glottolog), and every authority
        has its own name for the same languoid. Without this, the last loader
        to run would silently replace the curated name with Glottolog's.
        """
        existing = self["entity"].rows.get((entity_id,))
        if existing is not None and existing.get("name_display"):
            name_display = None
            code_display = None

        self["entity"].upsert(
            id=entity_id,
            type=entity_type,
            code_display=code_display or (None if existing else entity_id),
            name_display=name_display or (None if existing else entity_id),
            name_endonym=name_endonym,
        )

    def add_name(
        self,
        entity_id: str,
        entity_type: str,
        name: str | None,
        kind: str,
        language_tag: str | None = None,
        source: str | None = None,
    ) -> None:
        """Add a searchable name. Deduplicated on the schema's unique index."""
        if not name:
            return
        self["entity_name"].upsert(
            entity_id=entity_id,
            entity_type=entity_type,
            name=name,
            kind=kind,
            language_tag=language_tag,
            source=source,
        )

    # -- integrity ----------------------------------------------------------

    def resolve_foreign_keys(self) -> None:
        """Null out or drop rows whose foreign keys do not resolve.

        Nullable FK  -> set to NULL and record a warning.
        Required FK  -> drop the row and record an error.

        Runs in O(total rows x FKs per table) with O(1) set lookups, after
        building one id set per referenced table.
        """
        id_sets: dict[str, set] = {}
        for name, table in self.tables.items():
            if len(table.pk) == 1:
                id_sets[name] = table.ids()

        for table in self.tables.values():
            if not table.fks:
                continue
            doomed: list[tuple] = []
            for key, row in table.rows.items():
                for col, target, nullable in table.fks:
                    value = row.get(col)
                    if value is None:
                        continue
                    if value in id_sets.get(target, set()):
                        continue
                    ident = key[0] if len(key) == 1 else "/".join(str(k) for k in key)
                    if nullable:
                        row[col] = None
                        self.warn(
                            None,
                            f"{table.name}.{col}",
                            f"{table.name} {ident}: {col}={value!r} "
                            f"does not exist in {target}; set to NULL",
                        )
                    else:
                        doomed.append(key)
                        self.error(
                            None,
                            f"{table.name}.{col}",
                            f"{table.name} {ident}: required {col}={value!r} "
                            f"does not exist in {target}; row dropped",
                        )
                        break
            for key in doomed:
                table.rows.pop(key, None)

    def report_conflicts(self) -> None:
        """Promote per-table merge conflicts into findings."""
        for table in self.tables.values():
            for key, col, old, new in table._conflicts:
                ident = key[0] if len(key) == 1 else "/".join(str(k) for k in key)
                self.warn(
                    None,
                    f"{table.name}.{col}",
                    f"{table.name} {ident}: conflicting values for {col}: "
                    f"{old!r} then {new!r}; kept the later one",
                )

    def counts(self) -> dict[str, int]:
        return {name: len(t) for name, t in self.tables.items() if len(t)}


# ---------------------------------------------------------------------------
# Table specifications
# ---------------------------------------------------------------------------
#
# Order matters: this is the COPY order, and it follows the foreign-key
# dependency chain. `entity` is first because every core table references it.


@dataclass(frozen=True)
class TableSpec:
    name: str
    columns: tuple[str, ...]
    pk: tuple[str, ...]
    fks: tuple[Fk, ...] = ()
    # Values for columns declared NOT NULL DEFAULT <x> in the schema. Applied
    # at COPY time, not during extraction. See Table.tuples().
    defaults: tuple[tuple[str, Any], ...] = ()


TABLE_SPECS: tuple[TableSpec, ...] = (
    TableSpec(
        "entity",
        ("id", "type", "code_display", "name_display", "name_endonym"),
        ("id",),
    ),
    TableSpec(
        "territory",
        (
            "id", "code_alpha3", "code_numeric", "scope", "name_endonym",
            "contained_un_region_id", "sovereign_id", "population_from_un",
            "literacy_percent", "gdp", "land_area_km2", "latitude", "longitude",
            "source_ref",
        ),
        ("id",),
        (("contained_un_region_id", "territory", True),
         ("sovereign_id", "territory", True)),
    ),
    TableSpec(
        "writing_system",
        (
            "id", "scope", "name_full", "name_endonym", "name_display_original",
            "unicode_version", "sample", "right_to_left", "primary_language_id",
            "territory_of_origin_id", "parent_writing_system_id", "source_ref",
        ),
        ("id",),
        (("primary_language_id", "language", True),
         ("territory_of_origin_id", "territory", True),
         ("parent_writing_system_id", "writing_system", True)),
    ),
    TableSpec(
        "language",
        (
            "id", "name_canonical", "name_subtitle", "name_endonym", "name_french",
            "modality", "primary_script_id", "latitude", "longitude", "coords_source",
            "vitality_meta", "vitality_eth_fine", "vitality_eth_coarse", "iso_status",
            "viability_confidence", "viability_explanation", "recommendation",
            "recommendation_reason", "population_rough", "source_ref",
        ),
        ("id",),
        (("primary_script_id", "writing_system", True),),
    ),
    TableSpec(
        "language_source_attribute",
        (
            "language_id", "source", "code", "name", "scope", "notes",
            "parent_language_id", "code_6391", "retirement_reason",
            "eth_population", "eth_vitality_2012", "eth_vitality_2025",
            "eth_digital_support", "cldr_data_provider_id", "is_manual_override",
        ),
        ("language_id", "source"),
        (("language_id", "language", False),
         ("parent_language_id", "language", True),
         ("cldr_data_provider_id", "entity", True)),
        (("is_manual_override", False),),
    ),
    TableSpec(
        "variant",
        ("id", "description", "date_added", "variant_type",
         "equivalent_language_id", "source_ref"),
        ("id",),
        (("equivalent_language_id", "language", True),),
    ),
    TableSpec(
        "organization",
        ("id", "url", "collector_type", "parent_id", "hq_territory_id", "source_ref"),
        ("id",),
        (("parent_id", "organization", True),
         ("hq_territory_id", "territory", True)),
    ),
    TableSpec(
        "census",
        (
            "id", "territory_id", "year_collected", "language_use", "proficiency",
            "acquisition_order", "domain", "population", "population_source",
            "population_surveyed", "population_with_positive_responses",
            "sample_rate", "sample_rate_note", "responses_per_individual", "age",
            "gender", "nationality", "residence_basis", "languages_included",
            "geographic_scope", "quantity", "notes", "collector_type",
            "collector_org_id", "presenter_org_id", "collector_name",
            "collector_name_short", "author", "url", "date_published",
            "date_accessed", "document_name", "section_name", "table_name",
            "column_name", "citation", "source_ref",
        ),
        ("id",),
        (("territory_id", "territory", False),
         ("collector_org_id", "organization", True),
         ("presenter_org_id", "organization", True)),
    ),
    TableSpec(
        "locale",
        (
            "id", "language_id", "script_id", "territory_id", "locale_source",
            "variant_key", "name_endonym", "official_status", "ecrml_protection",
            "lang_formed_here", "historic_presence", "pop_speaking_unadjusted",
            "pop_speaking_source", "pop_writing_unadjusted", "source_ref",
        ),
        ("id",),
        (("language_id", "language", False),
         ("script_id", "writing_system", True),
         ("territory_id", "territory", True)),
        (("variant_key", ""),),
    ),
    TableSpec(
        "keyboard",
        ("id", "platform", "territory_id", "input_script_id", "output_script_id",
         "variant_id", "downloads", "total_downloads", "source_ref"),
        ("id",),
        (("territory_id", "territory", True),
         ("input_script_id", "writing_system", True),
         ("output_script_id", "writing_system", True),
         ("variant_id", "variant", True)),
    ),
    # -- junctions ----------------------------------------------------------
    TableSpec(
        "locale_variant",
        ("locale_id", "variant_id", "position"),
        ("locale_id", "variant_id"),
        (("locale_id", "locale", False), ("variant_id", "variant", False)),
    ),
    TableSpec(
        "language_variant",
        ("language_id", "variant_id"),
        ("language_id", "variant_id"),
        (("language_id", "language", False), ("variant_id", "variant", False)),
    ),
    TableSpec(
        "variant_prefix",
        ("variant_id", "prefix"),
        ("variant_id", "prefix"),
        (("variant_id", "variant", False),),
    ),
    TableSpec(
        "writing_system_contains",
        ("parent_id", "child_id"),
        ("parent_id", "child_id"),
        (("parent_id", "writing_system", False), ("child_id", "writing_system", False)),
    ),
    TableSpec(
        "keyboard_language",
        ("keyboard_id", "language_id"),
        ("keyboard_id", "language_id"),
        (("keyboard_id", "keyboard", False), ("language_id", "language", False)),
    ),
    TableSpec(
        "keyboard_platform_support",
        ("keyboard_id", "os"),
        ("keyboard_id", "os"),
        (("keyboard_id", "keyboard", False),),
    ),
    TableSpec(
        "census_language_estimate",
        ("census_id", "language_id", "population_estimate", "raw_value",
         "is_suppressed", "source_name"),
        ("census_id", "language_id"),
        (("census_id", "census", False), ("language_id", "language", False)),
    ),
    # -- satellites ---------------------------------------------------------
    TableSpec(
        "language_udhr",
        ("language_id", "language_code_path", "name", "variant", "document_url"),
        ("language_id", "language_code_path", "variant"),
        (("language_id", "language", False),),
    ),
    TableSpec(
        "language_cldr_coverage",
        (
            "language_id", "explicit_script_id", "script_default_id",
            "territory_default_id", "count_of_cldr_locales", "target_coverage_level",
            "actual_coverage_level", "in_icu", "pct_values_confirmed",
            "pct_modern_complete", "pct_moderate_complete", "pct_basic_complete",
            "pct_core_complete",
        ),
        ("language_id",),
        (("language_id", "language", False),
         ("explicit_script_id", "writing_system", True),
         ("script_default_id", "writing_system", True),
         ("territory_default_id", "territory", True)),
    ),
    TableSpec(
        "language_cldr_missing_feature",
        ("language_id", "feature"),
        ("language_id", "feature"),
        (("language_id", "language_cldr_coverage", False),),
    ),
    TableSpec(
        "language_retirement",
        ("language_id", "name", "reason", "change_to_language_id", "remedy",
         "effective_date"),
        ("language_id",),
        (("language_id", "language", False),
         ("change_to_language_id", "language", True)),
    ),
    TableSpec(
        "language_code_alias",
        ("language_id", "alias_code", "alias_kind"),
        ("alias_code", "alias_kind"),
        (("language_id", "language", False),),
    ),
    TableSpec(
        "wikipedia_edition",
        ("wikipedia_subdomain", "locale_id", "language_id", "title_english",
         "title_local", "status", "language_name", "articles", "active_users", "url"),
        ("wikipedia_subdomain",),
        (("locale_id", "locale", True), ("language_id", "language", True)),
    ),
    TableSpec(
        "wikipedia_edition_script",
        ("wikipedia_subdomain", "script_id"),
        ("wikipedia_subdomain", "script_id"),
        (("wikipedia_subdomain", "wikipedia_edition", False),
         ("script_id", "writing_system", False)),
    ),
    TableSpec(
        "entity_name",
        ("entity_id", "entity_type", "name", "kind", "language_tag", "source"),
        ("entity_id", "name", "kind", "language_tag", "source"),
        (("entity_id", "entity", False),),
    ),
)

# The COPY order is the declaration order above.
TABLE_ORDER: tuple[str, ...] = tuple(spec.name for spec in TABLE_SPECS)
