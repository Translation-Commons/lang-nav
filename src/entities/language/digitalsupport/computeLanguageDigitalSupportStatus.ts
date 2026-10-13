/**
 * Translates the raw digital support data into semantic statuses. This is a companion to
 * computeLanguageDigitalSupportScore.ts -- the scores are still used for sorting, charts and the
 * overall metascore, while these statuses describe what is actually missing for a language.
 */
import { TechScope, TechSupportData } from '@entities/tech/TechnologyTypes';
import { CLDRCoverageData, CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { groupBy } from '@shared/lib/setUtils';
import { joinOxfordComma } from '@shared/lib/stringUtils';

import { getDigitalSupportStatusLabel } from '@strings/DigitalSupportStrings';

import type { LanguageData } from '../LanguageTypes';

import {
  DigitalSupportCategory,
  DigitalSupportDimension,
  DigitalSupportStatus,
  DigitalSupportStatusSummary,
  getTechScopeForSupportDim,
  WikipediaStatus,
} from './DigitalSupportTypes';

export const DIGITAL_SUPPORT_CATEGORIES: DigitalSupportCategory[] = [
  DigitalSupportDimension.Documentation,
  DigitalSupportDimension.Keyboards,
  DigitalSupportDimension.I18nFrameworks,
  DigitalSupportDimension.MachineTranslation,
  DigitalSupportDimension.Interfaces,
  DigitalSupportDimension.AI,
];

export type LangPlatform = { techShortName: string; entries: TechSupportData[] };

/** The operating systems that the interface data covers, in the order they are shown. */
export function getTechsForLanguage(lang: LanguageData, scope?: TechScope): LangPlatform[] {
  const tss = lang.techSupport?.filter(({ tech }) => !scope || tech.scope == scope) ?? [];
  const tssGrouped = groupBy(tss, (ts) => ts.techShortName);

  return Object.keys(tssGrouped).map((techShortName) => ({
    techShortName,
    entries: tssGrouped[techShortName],
  }));
}

export function getLanguageIsSupportedBy(lang: LanguageData, techShortName: string): boolean {
  return lang.techSupport?.some((support) => support.techShortName === techShortName) ?? false;
}

/** CLDR data may be provided by another language, eg. a macrolanguage covering its members. */
export function getCLDRCoverage(lang: LanguageData): CLDRCoverageData | undefined {
  const { coverage, dataProvider } = lang.CLDR;
  if (coverage != null) return coverage;
  if (dataProvider?.type === EntityType.Language) return getCLDRCoverage(dataProvider);
  return undefined;
}

export function getDigitalSupportStatus(
  lang: LanguageData,
  dimension: DigitalSupportDimension,
): DigitalSupportStatusSummary {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return getOverallStatus(lang);
    case DigitalSupportDimension.Documentation:
      return getDocumentationStatus(lang);
    case DigitalSupportDimension.Interfaces:
      return getInterfacesStatus(lang);
    case DigitalSupportDimension.Keyboards:
      return getKeyboardsStatus(lang);
    case DigitalSupportDimension.I18nFrameworks:
      return getI18nFrameworksStatus(lang);
    case DigitalSupportDimension.MachineTranslation:
    case DigitalSupportDimension.AI:
      return getGeneralTechSupportStatus(lang, dimension);
    default:
      enforceExhaustiveSwitch(dimension);
  }
}

export function getExpectedCountOfPlatforms(dimension: DigitalSupportDimension): number {
  switch (dimension) {
    case DigitalSupportDimension.Overall:
      return 0;
    case DigitalSupportDimension.Documentation:
      return 2; // udhr, wikipedia
    case DigitalSupportDimension.Interfaces:
      return 4; // win11, macos, ios, android
    case DigitalSupportDimension.Keyboards:
      return 2; // gboard, keyman
    case DigitalSupportDimension.I18nFrameworks:
      return 2; // cldr, icu
    case DigitalSupportDimension.MachineTranslation:
      return 2; // gtranslate, ms translator
    case DigitalSupportDimension.AI:
      return 1; // claude
    default:
      enforceExhaustiveSwitch(dimension);
  }
}

/** Gaps come first so that the missing capabilities are the first thing read. */
export function getDigitalSupportStatusSeverity(status: DigitalSupportStatus): number {
  switch (status) {
    case DigitalSupportStatus.NotSupported:
      return 0;
    case DigitalSupportStatus.Partial:
      return 1;
    case DigitalSupportStatus.Unknown:
      return 2;
    case DigitalSupportStatus.Supported:
      return 3;
    default:
      enforceExhaustiveSwitch(status);
  }
}

function summarize(status: DigitalSupportStatus, label?: string): DigitalSupportStatusSummary {
  return { status, label: label ?? getDigitalSupportStatusLabel(status) };
}

function getOverallStatus(lang: LanguageData): DigitalSupportStatusSummary {
  const statuses = Object.values(DigitalSupportDimension)
    .filter((dim) => dim !== DigitalSupportDimension.Overall)
    .map((dimension) => getDigitalSupportStatus(lang, dimension).status);
  const supported = statuses.filter((status) => status === DigitalSupportStatus.Supported).length;
  const label = `${supported} of ${statuses.length} categories supported`;

  if (supported === statuses.length) return { status: DigitalSupportStatus.Supported, label };
  if (
    statuses.some(
      (status) =>
        status === DigitalSupportStatus.Supported || status === DigitalSupportStatus.Partial,
    )
  )
    return { status: DigitalSupportStatus.Partial, label };
  return { status: DigitalSupportStatus.NotSupported, label };
}

function getDocumentationStatus(lang: LanguageData): DigitalSupportStatusSummary {
  const hasUDHR = (lang.udhr?.length ?? 0) > 0;
  const wikipediaStatus = getBestWikipediaStatus(lang);

  if (wikipediaStatus === WikipediaStatus.Active) {
    return hasUDHR
      ? summarize(DigitalSupportStatus.Supported, 'Wikipedia and UDHR')
      : summarize(DigitalSupportStatus.Partial, 'Wikipedia only');
  }
  if (hasUDHR) {
    return summarize(
      DigitalSupportStatus.Partial,
      wikipediaStatus != null ? `UDHR, ${wikipediaStatus.toLowerCase()} Wikipedia` : 'UDHR only',
    );
  }
  if (wikipediaStatus != null) {
    return summarize(DigitalSupportStatus.Partial, `${wikipediaStatus} Wikipedia only`);
  }
  return summarize(DigitalSupportStatus.NotSupported, 'No Wikipedia or UDHR');
}

function getBestWikipediaStatus(lang: LanguageData): WikipediaStatus | undefined {
  const { wikipedias } = lang;
  if (!wikipedias || wikipedias.length === 0) return undefined;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Active))
    return WikipediaStatus.Active;
  if (wikipedias.some((wiki) => wiki.status === WikipediaStatus.Incubator))
    return WikipediaStatus.Incubator;
  return WikipediaStatus.Closed;
}

function getInterfacesStatus(lang: LanguageData): DigitalSupportStatusSummary {
  const platforms = getTechsForLanguage(lang, TechScope.OperatingSystem);
  const supported = platforms.filter((platform) => platform.entries.length > 0).length;
  const denom = getExpectedCountOfPlatforms(DigitalSupportDimension.Interfaces);
  const label = `${supported} of ${denom} platforms`;

  if (supported === denom) return { status: DigitalSupportStatus.Supported, label };
  if (supported === 0) return { status: DigitalSupportStatus.NotSupported, label };
  return { status: DigitalSupportStatus.Partial, label };
}

function getKeyboardsStatus(lang: LanguageData): DigitalSupportStatusSummary {
  const count = lang.keyboards?.length ?? 0;
  if (count === 0) return summarize(DigitalSupportStatus.NotSupported, 'No keyboards');
  return summarize(DigitalSupportStatus.Supported, `${count} keyboard${count > 1 ? 's' : ''}`);
}

function getI18nFrameworksStatus(lang: LanguageData): DigitalSupportStatusSummary {
  const coverage = getCLDRCoverage(lang);
  if (coverage == null) return summarize(DigitalSupportStatus.NotSupported, 'Not in CLDR');

  switch (coverage.actualCoverageLevel) {
    case CLDRCoverageLevel.Modern:
      return summarize(DigitalSupportStatus.Supported, 'Modern CLDR coverage');
    case CLDRCoverageLevel.Moderate:
      return summarize(DigitalSupportStatus.Supported, 'Moderate CLDR coverage');
    case CLDRCoverageLevel.Basic:
      return summarize(DigitalSupportStatus.Partial, 'Basic CLDR only');
    case CLDRCoverageLevel.Core:
      return summarize(DigitalSupportStatus.Partial, 'Core CLDR only');
    case CLDRCoverageLevel.Unknown:
      return summarize(DigitalSupportStatus.Unknown, 'CLDR coverage unknown');
    default:
      enforceExhaustiveSwitch(coverage.actualCoverageLevel);
  }
}

function getGeneralTechSupportStatus(
  lang: LanguageData,
  dim: DigitalSupportDimension,
): DigitalSupportStatusSummary {
  const techs = getTechsForLanguage(lang, getTechScopeForSupportDim(dim));

  return summarize(
    getSupportStatusByNumbers(techs.length, dim),
    joinOxfordComma(techs.map((t) => t.techShortName)) || 'Not supported',
  );
}

function getSupportStatusByNumbers(
  count: number,
  dim: DigitalSupportDimension,
): DigitalSupportStatus {
  if (count === 0) return DigitalSupportStatus.NotSupported;
  if (count === getExpectedCountOfPlatforms(dim)) return DigitalSupportStatus.Supported;
  return DigitalSupportStatus.Partial;
}
