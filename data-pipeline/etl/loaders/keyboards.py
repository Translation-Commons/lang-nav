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
from .authorities import iso_639_1_to_id

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
    by_6391 = iso_639_1_to_id(ds)
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

        # Two columns, deliberately. `variant_code_raw` keeps the subtag as
        # written; `variant_id` is the foreign key and only gets set when a
        # registered variant actually exists. The three private-use subtags in
        # this file ('x-upper', 'x-snd') are registered nowhere, so they have a
        # raw code and no id - and the frontend renders the raw code either way.
        variant_raw = row.get("Variant")
        variant_raw = variant_raw.lower() if variant_raw else None
        variant = variant_raw
        if variant and variant not in known_variants:
            ds.warn(kid, "keyboard.variant_id",
                    f"{row.origin()}: variant {variant!r} is unknown; "
                    f"kept as variant_code_raw, foreign key left NULL")
            variant = None

        ds["keyboard"].upsert(
            id=kid,
            platform="GBoard",
            territory_id=territory,
            input_script_id=_scripts(ds, kid, row, "Input Script ISO"),
            output_script_id=_scripts(ds, kid, row, "Output Script ISO"),
            variant_id=variant,
            variant_code_raw=variant_raw,
            source_ref=path.name,
        )

        # GBoard: exactly one language per keyboard, so position is always 0.
        language = row.get("Lang code")
        if language:
            language = by_6391.get(language, language)
            if language in known_languages:
                ds["keyboard_language"].upsert(
                    keyboard_id=kid, language_id=language, position=0
                )


def _keyman(ds: Dataset, path: Path) -> None:
    known_languages = ds["language"].ids()
    by_6391 = iso_639_1_to_id(ds)

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
        #
        # The cell names languages by their BCP-47 code, which is the TWO-LETTER
        # 639-1 code wherever one exists - `ak,ee,gaa,dag` mixes both widths in
        # a single row. A two-letter code is never a `language` id, so reading
        # the cell literally dropped 902 of 4,883 links across 169 distinct
        # codes. Resolving through the alias table first is what the frontend
        # already does: connectKeyboards.ts looks the same cell up in the BCP
        # dictionary, which is keyed on 639-1.
        #
        # `position` preserves the cell's order, which the frontend renders
        # verbatim. A repeated code keeps the position of its FIRST appearance:
        # `ku,kmr,ku,ckb` yields ku=0, kmr=1, ckb=3. The gap at 2 is harmless
        # since only the sort order is read, never the absolute value.
        #
        # The `seen` guard is doing real work: upsert overwrites with the later
        # value and records a conflict, so without it 25 rows across the file
        # (`pt,pt`, `en,en,en`, fv_all's 9 repeats) would both take the wrong
        # position and file a data-quality finding for a file that is merely
        # repetitive, not inconsistent.
        seen_languages: set[str] = set()
        for index, language in enumerate(split_multi(row.get("Lang codes"), seps=",")):
            language = by_6391.get(language, language)
            if language in seen_languages or language not in known_languages:
                continue
            seen_languages.add(language)
            ds["keyboard_language"].upsert(
                keyboard_id=kid, language_id=language, position=index
            )

        # 'windows,macos,ios' unpivoted into one row per operating system,
        # keeping the source order for the same reason and with the same guard.
        seen_os: set[str] = set()
        for index, os_name in enumerate(split_multi(row.get("Platform Support"), seps=",")):
            if os_name in seen_os:
                continue
            seen_os.add(os_name)
            ds["keyboard_platform_support"].upsert(
                keyboard_id=kid, os=os_name, position=index
            )
