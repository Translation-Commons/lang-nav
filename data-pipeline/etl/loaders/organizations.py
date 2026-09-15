"""organization.

Ids carry an 'org.' prefix, enforced by a CHECK constraint in the schema. The
prefix exists so organization ids cannot collide with the two- and three-letter
codes used by every other entity type in the shared id namespace.
"""

from __future__ import annotations

from pathlib import Path

from ..registry import Dataset
from ..sources import read_table

ENTITY_TYPE = "Organization"
PREFIX = "org."


def org_id(short_name: str) -> str:
    return PREFIX + short_name


def load(ds: Dataset, root: Path) -> None:
    path = root / "tc" / "organizations.tsv"
    parents: list[tuple[str, str]] = []

    for row in read_table(path):
        short = row.get("Short Name")
        if not short:
            continue
        oid = org_id(short)

        name = row.get("Name") or short
        endonym = row.get("Endonym")

        # code_display drops the prefix: 'org.StatCAN' displays as 'StatCAN'.
        ds.register_entity(
            oid, ENTITY_TYPE, code_display=short, name_display=name,
            name_endonym=endonym,
        )
        ds.add_name(oid, ENTITY_TYPE, name, "display", language_tag="en")
        ds.add_name(oid, ENTITY_TYPE, short, "alias", language_tag="en")
        ds.add_name(oid, ENTITY_TYPE, endonym, "endonym")

        ds["organization"].upsert(
            id=oid,
            url=row.get("URL"),
            hq_territory_id=row.get("Headquarters"),
            source_ref=path.name,
        )

        parent = row.get("Parent")
        if parent:
            parents.append((oid, org_id(parent)))

    known = ds["organization"].ids()
    for oid, parent_id in parents:
        if parent_id not in known:
            ds.warn(
                oid,
                "organization.parent_id",
                f"{path.name}: parent organization {parent_id!r} of {oid!r} is "
                f"not defined; left NULL",
            )
            continue
        if parent_id == oid:
            continue  # org_not_own_parent
        ds["organization"].upsert(id=oid, parent_id=parent_id)
