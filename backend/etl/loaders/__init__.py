"""Extractor registry.

Order matters and is not a preference: every loader depends on ids created by
the ones above it. Territories and writing systems come first because language
references a script; languages come before locales; variants come before the
locale-variant junction; organizations come before censuses because a census
cites its collector.
"""

from __future__ import annotations

from pathlib import Path
from typing import Callable

from ..registry import Dataset
from . import (
    authorities,
    census,
    keyboards,
    languages,
    locales,
    organizations,
    satellites,
    territories,
    variants,
    writing_systems,
)

Loader = Callable[[Dataset, Path], None]

# (label, callable) in execution order.
LOADERS: tuple[tuple[str, Loader], ...] = (
    ("territories", territories.load),
    ("writing systems", writing_systems.load),
    ("languages", languages.load),
    ("authorities", authorities.load),
    ("organizations", organizations.load),
    ("locales", locales.load),
    ("variants", variants.load),
    ("locale variants", lambda ds, _root: locales.attach_variants(ds)),
    ("census", census.load),
    ("keyboards", keyboards.load),
    ("satellites", satellites.load),
)

__all__ = ["LOADERS", "Loader"]
