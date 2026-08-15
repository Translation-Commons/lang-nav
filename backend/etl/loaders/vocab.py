"""Vocabulary maps between source-file spellings and the schema's values.

Kept in one module because these mappings are where silent data loss hides.
Every map is closed: an unrecognised value returns None and the caller records
a finding, rather than being coerced to a plausible-looking default.
"""

from __future__ import annotations

# territory.scope -> territory_scope.id
# The source file writes "Sub-continent"; the lookup table calls it
# "Subcontinent". Mapping rather than renaming either side.
TERRITORY_SCOPE = {
    "World": 6,
    "Continent": 5,
    "Region": 4,
    "Sub-continent": 3,
    "Subcontinent": 3,
    "Country": 2,
    "Dependency": 1,
}

# language.modality -> language_modality.id. Note the negative values: the axis
# runs written(-2) to spoken(2), with sign(3) deliberately off to one side.
LANGUAGE_MODALITY = {
    "Written": -2,
    "Mostly Written": -1,
    "Spoken & Written": 0,
    "Mostly Spoken": 1,
    "Spoken": 2,
    "Sign": 3,
}

# language_source_attribute.scope -> language_scope.id
LANGUAGE_SCOPE_BY_NAME = {
    "Family": 5,
    "Macrolanguage": 4,
    "Language": 3,
    "Dialect": 2,
    "SpecialCode": 1,
    "Special Code": 1,
}

# iso-639-3.tab "Scope" column
ISO_SCOPE = {"I": 3, "M": 4, "S": 1}

# glottolog.tsv "level" column
GLOTTOLOG_LEVEL = {"family": 5, "language": 3, "dialect": 2}

# iso-639-3.tab "Language_Type" -> language_iso_status.id
ISO_STATUS = {"L": 9, "C": 3, "H": 1, "E": 0, "S": -1}

# sil/ethnologue2012.tsv "Eth_Language Status" -> vitality_eth_fine.id.
# Ported from parseVitalityEthnologue2012 (VitalityParsing.ts:13-62), keys
# lowercased because that function lowercases before matching.
#
# THE NUMERIC KEYS RUN THE OTHER WAY. EGIDS numbers a healthier language
# LOWER, and the scale stored here is 0-9 with 9 healthiest, so '1' maps to 9
# and '10' maps to 0. Reading the file's numbers straight through inverts every
# vitality in the dataset and produces a complete, plausible, backwards answer.
#
# The fractional keys are real: the republication in "Digital Language Death"
# that supplies these numbers uses 6.5 and 8.5 for the merged buckets, and 7.7
# for rows that are NOT in the Ethnologue dataset at all - which maps to
# nothing, deliberately, and is why this dict cannot just be a range.
ETHNOLOGUE_VITALITY_2012 = {
    "international": 9, "national": 9, "1": 9,
    "provincial": 8, "regional": 8, "2": 8,
    "trade": 7, "wider communication": 7, "3": 7,
    "educational": 6, "4": 6,
    "written": 5, "developing": 5, "5": 5,
    "vigorous": 4, "6": 4, "threatened": 4, "6.5": 4,
    "shifting": 3, "7": 3,
    "moribund": 2, "8": 2, "nearly extinct": 2, "8.5": 2,
    "dormant": 1, "9": 1,
    "extinct": 0, "10": 0,
}

# sil/ethnologue2025.tsv "Vitality" -> vitality_eth_coarse.id.
# parseVitalityEthnologue2025 (VitalityParsing.ts:67-85).
ETHNOLOGUE_VITALITY_2025 = {
    "institutional": 9,
    "stable": 6,
    "endangered": 3,
    "extinct": 0,
}

# writing_system_scope enum. The file spellings already match the enum labels.
WRITING_SYSTEM_SCOPE = {
    "Group",
    "Individual script",
    "Variation",
    "Special Code",
}

# official_status enum
OFFICIAL_STATUS = {
    "official",
    "de_facto_official",
    "recognized",
    "official_regional",
    "recognized_regional",
}

# population_source_category enum. The TypeScript enum spells the absent case
# as an empty string, which is a trap in every SQL tool, so it maps to the
# explicit label 'NoSource'.
POPULATION_SOURCE = {
    "Official",
    "Unverified Official",
    "Study",
    "Ethnologue",
    "EDL",
    "CLDR",
    "Other",
    "NoSource",
    "Aggregated from Territories",
    "Aggregated from Languages",
    "Algorithmic",
}

# census_collector_type enum
COLLECTOR_TYPE = {"Government", "Study", "NGO", "Media", "Secondary", "Unknown"}

# census_language_use enum
LANGUAGE_USE = {"Understands", "Speaks", "Writes", "Reads", "Uses", "Ethnicity"}

# wikipedia_status enum. The source file also contains 'Deleted', which the
# schema does not model; the loader records that rather than guessing.
WIKIPEDIA_STATUS = {"Active", "Closed", "Incubator"}

# cldr_coverage_level enum
CLDR_LEVEL = {"core", "basic", "moderate", "modern"}

# The seven classification authorities (language_source enum).
SOURCE_COMBINED = "Combined"
SOURCE_ISO = "ISO"
SOURCE_BCP = "BCP"
SOURCE_UNESCO = "UNESCO"
SOURCE_GLOTTOLOG = "Glottolog"
SOURCE_CLDR = "CLDR"
SOURCE_ETHNOLOGUE = "Ethnologue"

# Language codes the census parser deliberately ignores: aggregate or
# placeholder codes that are not languages.
IGNORED_LANGUAGE_CODES = {"language code", "mul", "mis", "und", "zxx", ""}


def is_ignored_language_code(code: str) -> bool:
    """Mirrors the frontend's isIgnoredLanguageCode()."""
    return code.startswith("#") or code.lower() in IGNORED_LANGUAGE_CODES
