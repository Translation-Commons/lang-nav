"""variant and variant_prefix, from the IANA subtag registry.

iana/variants.txt is the only non-tabular source: '%%'-delimited records with
repeating keys and wrapped continuation lines. Prefix repeats and its values
may be composite ('zh-Latn', 'oc-lengadoc'), not just plain language codes, so
prefixes are stored as text and deliberately not constrained to a foreign key.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_iana_registry, read_table, to_date

ENTITY_TYPE = "Variant"


def load(ds: Dataset, root: Path) -> None:
    _iana(ds, root / "iana" / "variants.txt")
    _annotations(ds, root / "tc" / "variant_annotations.tsv")


def _iana(ds: Dataset, path: Path) -> None:
    for record in read_iana_registry(path):
        if record.first("Type") != "variant":
            continue
        subtag = record.first("Subtag")
        if not subtag:
            continue
        vid = subtag.lower()

        descriptions = record.all("Description")
        name = descriptions[0] if descriptions else vid

        ds.register_entity(vid, ENTITY_TYPE, code_display=subtag, name_display=name)
        for description in descriptions:
            ds.add_name(vid, ENTITY_TYPE, description, "display", language_tag="en")

        ds["variant"].upsert(
            id=vid,
            description=record.first("Comments"),
            date_added=to_date(record.first("Added")),
            source_ref=path.name,
        )

        for prefix in record.all("Prefix"):
            ds["variant_prefix"].upsert(variant_id=vid, prefix=prefix)


def _annotations(ds: Dataset, path: Path) -> None:
    """Project-curated variant type and cross-entity equivalence.

    equivalent_language_id records that the variant 'valencia' names the same
    thing as the languoid 'vale1252'.
    """
    known_variants = ds["variant"].ids()
    known_languages = ds["language"].ids()

    for row in read_table(path):
        raw_id = row.get("ID")
        if not raw_id:
            continue
        vid = raw_id.lower()
        if vid not in known_variants:
            ds.warn(
                vid,
                "variant.id",
                f"{row.origin()}: annotated variant {raw_id!r} is not in the "
                f"IANA registry; skipped",
            )
            continue

        variant_type = row.get("VariantType")
        if variant_type not in (None, "o", "d"):
            ds.warn(
                vid,
                "variant.variant_type",
                f"{row.origin()}: unrecognised VariantType {variant_type!r}; left NULL",
            )
            variant_type = None

        equivalent = row.get("EquivalentLanguageCode")
        if equivalent and equivalent not in known_languages:
            ds.warn(
                vid,
                "variant.equivalent_language_id",
                f"{row.origin()}: equivalent language {equivalent!r} is unknown; "
                f"left NULL",
            )
            equivalent = None

        ds["variant"].upsert(
            id=vid, variant_type=variant_type, equivalent_language_id=equivalent
        )

        if equivalent:
            ds["language_variant"].upsert(language_id=equivalent, variant_id=vid)
