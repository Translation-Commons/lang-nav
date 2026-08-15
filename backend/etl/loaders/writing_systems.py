"""writing_system and its grouping junction.

Two DIFFERENT relations live in this file and must not be collapsed:

  "Writing System Orig"          -> parent_writing_system_id, the DERIVATION
                                    lineage (Cyrillic descends from Greek)
  "Group of other writing systems" -> writing_system_contains, GROUPING
                                    (Hani contains Hans and Hant)
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table, split_multi, to_bool, to_decimal
from .vocab import WRITING_SYSTEM_SCOPE

ENTITY_TYPE = "WritingSystem"


def load(ds: Dataset, root: Path) -> None:
    path = root / "tc" / "writingSystems.tsv"
    groupings: list[tuple[str, str]] = []

    for row in read_table(path):
        wid = row.get("ISO 15924 (sortkey)")
        if not wid:
            continue

        scope = row.get("Scope")
        if scope not in WRITING_SYSTEM_SCOPE:
            ds.warn(
                wid,
                "writing_system.scope",
                f"{row.origin()}: unrecognised Scope {scope!r}; "
                f"row skipped because scope is NOT NULL",
            )
            continue

        name = row.get("Display Name")
        endonym = row.get("Endonym")

        ds.register_entity(
            wid, ENTITY_TYPE, code_display=wid, name_display=name,
            name_endonym=endonym,
        )
        ds.add_name(wid, ENTITY_TYPE, name, "display", language_tag="en")
        ds.add_name(wid, ENTITY_TYPE, endonym, "endonym")
        ds.add_name(wid, ENTITY_TYPE, row.get("Full Name"), "alias", language_tag="en")

        ds["writing_system"].upsert(
            id=wid,
            scope=scope,
            name_full=row.get("Full Name"),
            name_endonym=endonym,
            unicode_version=to_decimal(row.raw("First Unicode Version")),
            sample=row.get("Sample"),
            right_to_left=to_bool(row.raw("RTL?")),
            primary_language_id=row.get("Language of Origin"),
            territory_of_origin_id=row.get("Territory of Origin"),
            parent_writing_system_id=row.get("Writing System Orig"),
            source_ref=path.name,
        )

        # Grouping is a separate M:N relation, deferred until every writing
        # system id is known so the junction's required FKs can be checked.
        for child in split_multi(row.get("Group of other writing systems"), seps=", "):
            groupings.append((wid, child))

    known = ds["writing_system"].ids()
    for parent, child in groupings:
        if child not in known:
            ds.warn(
                parent,
                "writing_system_contains.child_id",
                f"{path.name}: group member {child!r} of {parent!r} is not a "
                f"known writing system; edge dropped",
            )
            continue
        if parent == child:
            continue  # ws_contains_not_self
        ds["writing_system_contains"].upsert(parent_id=parent, child_id=child)
