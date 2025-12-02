/**
 * Build script to generate a list of CLDR locale support objects.
 *
 * This script fetches data from the Unicode CLDR project and combines
 * multiple data sources to produce a JSON file consumed by the UI. The
 * output file is stored in `public/data/unicode/cldrLocales.json` and
 * includes one entry per locale with a variety of support metrics. These
 * metrics include whether the locale has an XML file in the CLDR
 * repository, the tier of support (core, modern, full), coverage levels
 * and percentages, ICU inclusion, default-content flags and more.
 *
 * This script is not executed at runtime by the browser. Instead it is
 * intended to be run manually or as part of a build pipeline. Because
 * network access may not be available when run in some environments, the
 * script is defensive: network calls are isolated and the data sources
 * are configurable via constants at the top of the file.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const CLDR_RELEASE = '43.0.0';
const CLDR_CORE_BASE = `https://cdn.jsdelivr.net/npm/cldr-core@${CLDR_RELEASE}`;
const CHARTS_TSV_BASE = `https://raw.githubusercontent.com/unicode-org/cldr-staging/main/docs/charts/${CLDR_RELEASE.replace(
  /\.0\.0$/,
  '',
)}/tsv`;
const CLDR_REPO_RAW_BASE = 'https://raw.githubusercontent.com/unicode-org/cldr/main/common/main';

const OUTPUT_FILE = path.join(process.cwd(), 'public/data/unicode/cldrLocales.json');

/** Simple TSV parser (no quoted fields needed for CLDR TSVs) */
function parseTsv(tsv: string): Record<string, string>[] {
  const lines = tsv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = values[idx] ?? '';
    });
    return obj;
  });
}

/** Check if `common/main/<locale>.xml` exists in the CLDR repo */
async function xmlExists(locale: string): Promise<boolean> {
  const url = `${CLDR_REPO_RAW_BASE}/${locale}.xml`;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    // Treat network failures as "unknown/false"
    return false;
  }
}

interface RawCoverageRow {
  'Language/Locale': string;
  'Target Level': string;
  '≟': string;
  'Computed Level': string;
  ICU: string;
  '%': string;
  'ⓜ%': string;
  'ⓑ%': string;
  'ⓒ%': string;
  'Missing Features': string;
  'Default Region': string;
}

interface RawMissingCountsRow {
  'Language/Locale': string;
  Found: string;
  Unconfirmed: string;
  Missing: string;
}

interface AvailableLocales {
  /**
   * Locales in the “core” coverage tier.  Not all releases publish a core
   * list, so this property is optional.
   */
  core?: string[];
  /** Locales in the “modern” coverage tier. */
  modern?: string[];
  /** Locales in the “full” coverage tier. */
  full?: string[];
  /** List of default content locales, from defaultContent.json. */
  defaultContent?: string[];
}

/** Main routine */
async function buildCldrLocales(): Promise<void> {
  const availablePromise = fetch(`${CLDR_CORE_BASE}/availableLocales.json`).then((r) => r.json());
  const coverageTsvPromise = fetch(`${CHARTS_TSV_BASE}/locale-coverage.tsv`).then((r) => r.text());
  const missingCountsTsvPromise = fetch(`${CHARTS_TSV_BASE}/locale-missing-counts.tsv`).then((r) =>
    r.text(),
  );

  const [availableLocales, coverageTsv, missingTsv] = await Promise.all([
    availablePromise,
    coverageTsvPromise,
    missingCountsTsvPromise,
  ]);

  // Cast to our interface.  Some keys (e.g. core) may be missing from
  // availableLocales.json depending on the CLDR release, so we treat
  // absent properties as empty arrays below.
  const available: AvailableLocales = availableLocales as AvailableLocales;
  const coverageRows = parseTsv(coverageTsv) as unknown as RawCoverageRow[];
  const missingRows = parseTsv(missingTsv) as unknown as RawMissingCountsRow[];

  const coverageMap: Record<string, RawCoverageRow> = {};
  for (const row of coverageRows) {
    const id = row['Language/Locale'];
    if (id && id.includes('_')) coverageMap[id] = row;
  }
  const missingMap: Record<string, RawMissingCountsRow> = {};
  for (const row of missingRows) {
    const id = row['Language/Locale'];
    if (id && id.includes('_')) missingMap[id] = row;
  }

  // Normalise the lists.  If a tier list is undefined in this release we
  // substitute an empty array so that spread operations don’t blow up.
  const coreList: string[] = Array.isArray(available.core) ? available.core : [];
  const modernList: string[] = Array.isArray(available.modern) ? available.modern : [];
  const fullList: string[] = Array.isArray(available.full) ? available.full : [];
  const localeList = new Set<string>([...coreList, ...modernList, ...fullList]);
  const output: any[] = [];

  const pct = (value: string): number | undefined => {
    if (!value || value.trim() === '' || value.trim() === '—') return undefined;
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : undefined;
  };

  for (const loc of localeList) {
    // Lookup coverage and missing-count rows using the raw locale ID
    // (which uses hyphens).
    const coverage = coverageMap[loc];
    const missing = missingMap[loc];

    // Determine tier based on the target coverage level reported in the
    // locale-coverage.tsv file.  Coverage levels use the same naming as
    // our tier type (core, basic, moderate, modern).  Some rows prefix
    // the level with an asterisk to indicate a computed value; strip any
    // leading non‑letters before comparison.  If no coverage information
    // exists for this locale, fall back to the modern tier.  We do not
    // expose a separate “full” tier; locales in the full list will be
    // classified according to their coverage level.
    let tier: 'core' | 'basic' | 'moderate' | 'modern' = 'modern';
    if (coverage && coverage['Target Level']) {
      const rawLevel = coverage['Target Level'].replace(/^[^A-Za-z]*/, '').toLowerCase();
      if (rawLevel === 'core' || rawLevel === 'basic' || rawLevel === 'moderate' || rawLevel === 'modern') {
        tier = rawLevel as typeof tier;
      }
    }

    // Flag default-content locales.  If the defaultContent list is absent,
    // treat all locales as non-default.
    const isDefault = Array.isArray(available.defaultContent)
      ? available.defaultContent.includes(loc)
      : false;

    // Queue XML existence check; resolve after building objects
    const xmlPromise = xmlExists(loc);

    // Prepare a normalised version of the locale for downstream lookup.  The
    // UI expects underscores as separators.
    const subtags = loc.split('-');
    const normalizedLocale = subtags.join('_');
    const language = subtags[0];
    let script: string | undefined;
    let region: string | undefined;
    if (subtags.length === 2) {
      const second = subtags[1];
      if (/^[A-Z][a-z]{3}$/.test(second)) {
        script = second;
      } else {
        region = second;
      }
    } else if (subtags.length >= 3) {
      const second = subtags[1];
      const third = subtags[2];
      if (/^[A-Z][a-z]{3}$/.test(second)) {
        script = second;
        region = third;
      } else {
        region = second;
      }
    }

    output.push({
      locale: normalizedLocale,
      language,
      region,
      script,
      tier,
      localeIsDefaultForLanguage: isDefault,
      targetLevel: coverage?.['Target Level'] || undefined,
      computedLevel: coverage?.['Computed Level'] || undefined,
      confirmedPct: pct(coverage?.['%'] || ''),
      pctModern: pct(coverage?.['%'] || ''),
      pctModerate: pct(coverage?.['ⓜ%'] || ''),
      pctBasic: pct(coverage?.['ⓑ%'] || ''),
      pctCore: pct(coverage?.['ⓒ%'] || ''),
      icuIncluded: coverage?.ICU?.toLowerCase().includes('icu') ?? false,
      defaultRegion: coverage?.['Default Region'] || undefined,
      notes:
        coverage && coverage['Missing Features']
          ? coverage['Missing Features'].split(/,\s*/)
          : [],
      missingCounts: missing
        ? {
            found: Number.parseInt(missing.Found || '0', 10),
            unconfirmed: Number.parseInt(missing.Unconfirmed || '0', 10),
            missing: Number.parseInt(missing.Missing || '0', 10),
          }
        : undefined,
      __xmlPromise: xmlPromise,
    });
  }

  // Resolve XML presence flags
  await Promise.all(
    output.map(async (entry) => {
      const present = await entry.__xmlPromise;
      entry.presentInCLDRDatabase = present;
      delete entry.__xmlPromise;
    }),
  );

  const finalOutput = {
    release: CLDR_RELEASE,
    generatedAt: new Date().toISOString(),
    locales: output,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalOutput, null, 2));
  console.log(`Wrote ${output.length} locale records to ${OUTPUT_FILE}`);
}

buildCldrLocales().catch((err) => {
  console.error(err);
  process.exit(1);
});
