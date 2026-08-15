"""keyboard and its two junctions, from GBoard and Keyman.

One table serves two platforms, and the schema's keyboard_platform_fields CHECK
enforces that platform-specific columns are only set for their own platform:
GBoard rows carry a territory and a variant but no download counts, Keyman rows
carry download counts but neither territory nor variant. Violating that is an
easy mistake to make and produces silent nonsense, so it is a constraint.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, split_multi, to_int

ENTITY_TYPE = "Keyboard"


def load(ds: Dataset, root: Path) -> None:
    _gboard(ds, root / "google" / "gboards.tsv")
    _keyman(ds, root / "keyman" / "keyboards.tsv")


def _scripts(ds: Dataset, kid: str, row, column: str) -> str | None:
    value = row.get(column)
    if value and value not in ds["writing_system"].ids():
        ds.warn(
            kid,
            f"keyboard.{column}",
            f"{row.origin()}: writing system {value!r} is unknown; left NULL",
        )
        return None
    return value


def _gboard(ds: Dataset, path: Path) -> None:
    known_languages = ds["language"].ids()
    known_territories = ds["territory"].ids()
    known_variants = ds["variant"].ids()

    for row in read_table(path):
        kid = row.get("ID")
        if not kid:
            continue

        name = row.get("Name") or kid
        ds.register_entity(kid, ENTITY_TYPE, code_display=kid, name_display=name)
        ds.add_name(kid, ENTITY_TYPE, name, "display", language_tag="en")

        territory = row.get("Country Code")
        if territory and territory not in known_territories:
            ds.warn(kid, "keyboard.territory_id",
                    f"{row.origin()}: territory {territory!r} is unknown; left NULL")
            territory = None

        variant = row.get("Variant")
        variant = variant.lower() if variant else None
        if variant and variant not in known_variants:
            ds.warn(kid, "keyboard.variant_id",
                    f"{row.origin()}: variant {variant!r} is unknown; left NULL")
            variant = None

        ds["keyboard"].upsert(
            id=kid,
            platform="GBoard",
            territory_id=territory,
            input_script_id=_scripts(ds, kid, row, "Input Script ISO"),
            output_script_id=_scripts(ds, kid, row, "Output Script ISO"),
            variant_id=variant,
            source_ref=path.name,
        )

        # GBoard: exactly one language per keyboard.
        language = row.get("Lang code")
        if language and language in known_languages:
            ds["keyboard_language"].upsert(keyboard_id=kid, language_id=language)


def _keyman(ds: Dataset, path: Path) -> None:
    known_languages = ds["language"].ids()

    for row in read_table(path):
        kid = row.get("ID")
        if not kid:
            continue

        name = row.get("Name") or kid
        ds.register_entity(kid, ENTITY_TYPE, code_display=kid, name_display=name)
        ds.add_name(kid, ENTITY_TYPE, name, "display", language_tag="en")

        ds["keyboard"].upsert(
            id=kid,
            platform="Keyman",
            input_script_id=_scripts(ds, kid, row, "Input Script ISO"),
            output_script_id=_scripts(ds, kid, row, "Output Script ISO"),
            downloads=to_int(row.raw("Downloads")),
            total_downloads=to_int(row.raw("Total Downloads")),
            source_ref=path.name,
        )

        # Keyman: one or more languages, comma separated in a single cell.
        for language in split_multi(row.get("Lang codes"), seps=","):
            if language in known_languages:
                ds["keyboard_language"].upsert(keyboard_id=kid, language_id=language)

        # 'windows,macos,ios' unpivoted into one row per operating system.
        for os_name in split_multi(row.get("Platform Support"), seps=","):
            ds["keyboard_platform_support"].upsert(keyboard_id=kid, os=os_name)
