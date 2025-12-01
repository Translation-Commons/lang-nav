import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';

import { maxBy } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

import {
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
  getLanguageISOStatusLabel,
} from './VitalityStrings';
import { AllVitalityInfo, VitalityInfo, VitalitySource } from './VitalityTypes';

/**
 * Computes the vitality metascore for a language using the algorithm:
 * 1. If both Ethnologue 2013 & 2025 values exist, return the average
 * 2. If only one Ethnologue value exists, return that
 * 3. If neither Ethnologue value exists, use ISO scale
 */
export function getVitalityMetascore(lang: LanguageData): number | undefined {
  const { ethFine, ethCoarse, iso } = lang.vitality || {};

  if (ethFine != null && ethCoarse != null) {
    // Both Ethnologue values exist - return average
    return (ethFine + ethCoarse) / 2;
  } else if (ethFine != null) {
    // Only Ethnologue 2013 exists
    return ethFine;
  } else if (ethCoarse != null) {
    // Only Ethnologue 2025 exists
    return ethCoarse;
  } else if (iso != null) {
    // Use ISO as fallback
    return iso;
  }
  return undefined;
}

export function getVitalityScore(source: VitalitySource, lang: LanguageData): number | undefined {
  switch (source) {
    case VitalitySource.ISO:
      return lang.vitality?.iso;
    case VitalitySource.Eth2013:
      return lang.vitality?.ethFine;
    case VitalitySource.Eth2025:
      return lang.vitality?.ethCoarse;
    case VitalitySource.Metascore:
      return lang.vitality?.meta;
  }
}

/**
 * Generates ReactNode explanations for vitality scores
 */
export function getVitalityExplanation(
  source: VitalitySource,
  lang: LanguageData,
): React.ReactNode {
  const { iso, ethFine, ethCoarse, meta } = lang.vitality ?? {};

  switch (source) {
    case VitalitySource.ISO:
      if (iso == null) return <Deemphasized>No ISO status available</Deemphasized>;
      return (
        <div>
          <div>ISO Status: {getLanguageISOStatusLabel(iso)}</div>
          <div>Normalized to a score of {iso} out of 9.</div>
        </div>
      );

    case VitalitySource.Eth2013:
      if (ethFine == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>
            Ethnologue 2013 Vitality: {getVitalityEthnologueFineLabel(ethFine)}
            <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
              methodology
            </LinkButton>
          </div>
          <div>Normalized to a score of {ethFine} out of 9.</div>
        </div>
      );

    case VitalitySource.Eth2025:
      if (ethCoarse == null) return <Deemphasized>No vitality data available</Deemphasized>;
      return (
        <div>
          <div>Ethnologue 2025 Vitality: {getVitalityEthnologueCoarseLabel(ethCoarse)}</div>
          <div>Normalized to a score of {ethCoarse} out of 9.</div>
        </div>
      );

    case VitalitySource.Metascore: {
      if (ethFine != null && ethCoarse != null && meta != null) {
        return (
          <div>
            <div>
              Ethnologue changed the methodology of its vitality scores. So we convert them to a
              normalized score and averaged the data from 2013 and 2025. Average: {meta.toFixed(1)}.
            </div>
            <div style={{ marginLeft: '2em' }}>
              2013: {getVitalityEthnologueFineLabel(ethFine)} ({ethFine}){' '}
              <LinkButton href="https://www.ethnologue.com/methodology/#language-status">
                methodology
              </LinkButton>
            </div>
            <div style={{ marginLeft: '2em' }}>
              2025: {getVitalityEthnologueCoarseLabel(ethCoarse)} ({ethCoarse})
            </div>
          </div>
        );
      }
    }
  }
  return (
    <Deemphasized>Vitality data not available from this source for this language</Deemphasized>
  );
}

export function computeVitalityMetascoreInfo(lang: LanguageData): VitalityInfo {
  const { ethFine, ethCoarse, iso } = lang.vitality || {};

  if (ethFine != null && ethCoarse != null) {
    // Both Ethnologue values exist - return average
    return {
      score: (ethFine + ethCoarse) / 2,
      label: ((ethFine + ethCoarse) / 2).toFixed(1),
      explanation: getVitalityExplanation(VitalitySource.Metascore, lang),
    };
  } else if (ethFine != null || ethCoarse != null) {
    const info =
      ethFine != null
        ? getVitalityInfo(VitalitySource.Eth2013, lang)
        : getVitalityInfo(VitalitySource.Eth2025, lang);
    return {
      score: info.score,
      label: info.label,
      explanation: (
        <>
          Ethnologue only has 1 value for this language:
          <br />
          {info.explanation}
        </>
      ),
    };
  } else if (iso != null) {
    const info = getVitalityInfo(VitalitySource.ISO, lang);
    return {
      score: info.score,
      label: info.label,
      explanation: (
        <>
          No data from Ethnologue, so we&apos;re just using the ISO status value:
          <br />
          {info.explanation}
        </>
      ),
    };
  }

  return {
    score: undefined,
    label: '—',
    explanation: <Deemphasized>No vitality data available</Deemphasized>,
  };
}

/**
 * Gets all available vitality scores for a language
 */
export function getVitalityInfo(source: VitalitySource, lang: LanguageData): VitalityInfo {
  switch (source) {
    case VitalitySource.ISO:
      return {
        score: lang.vitality?.iso,
        label: getLanguageISOStatusLabel(lang.ISO.status!),
        explanation: getVitalityExplanation(VitalitySource.ISO, lang),
      };
    case VitalitySource.Eth2013:
      return {
        score: lang.vitality?.ethFine,
        label: getVitalityEthnologueFineLabel(lang.vitality?.ethFine),
        explanation: getVitalityExplanation(VitalitySource.Eth2013, lang),
      };
    case VitalitySource.Eth2025:
      return {
        score: lang.vitality?.ethCoarse,
        label: getVitalityEthnologueCoarseLabel(lang.vitality?.ethCoarse),
        explanation: getVitalityExplanation(VitalitySource.Eth2025, lang),
      };
    case VitalitySource.Metascore:
      return computeVitalityMetascoreInfo(lang);
  }
}

/**
 * Gets all available vitality scores for a language
 */
export function getAllVitalityScores(lang: LanguageData): AllVitalityInfo {
  return Object.values(VitalitySource).reduce<AllVitalityInfo>((acc, source) => {
    acc[source] = getVitalityInfo(source, lang);
    return acc;
  }, {} as AllVitalityInfo);
}

export function computeLanguageVitality(languages: LanguageData[]): void {
  // For all language roots, recompute vitality scores
  languages
    .filter((lang) => lang.parentLanguage == null)
    .forEach((rootLang) => {
      // Force recomputation of vitality by clearing cached value
      computeLanguageFamilyVitality(rootLang);
    });
}

function computeLanguageFamilyVitality(lang: LanguageData): void {
  // First check that its descendants all have vitality data
  const descendants = lang.childLanguages || [];
  // Recursively compute vitality for all descendants first
  descendants.forEach((child) => computeLanguageFamilyVitality(child));

  // Now compute vitality for this language
  const vitality = lang.vitality || {};
  const { ethnologue2013, ethnologue2025 } = vitality;

  // If it's declared by a source use that, otherwise use its children's max vitality
  if (lang.ISO.status != null) {
    vitality.iso = lang.ISO.status;
  } else {
    vitality.iso = maxBy(descendants, (child) => child.vitality?.iso);
  }
  if (ethnologue2013 != null) {
    vitality.ethFine = ethnologue2013;
  } else {
    vitality.ethFine = maxBy(descendants, (child) => child.vitality?.ethFine);
  }
  if (ethnologue2025 != null) {
    vitality.ethCoarse = ethnologue2025;
  } else {
    vitality.ethCoarse = maxBy(descendants, (child) => child.vitality?.ethCoarse);
  }

  // Compute the meta score and return
  vitality.meta = getVitalityMetascore(lang);

  if (['ine', 'gem', 'gmw', 'eng', 'deu'].includes(lang.ID))
    console.log(
      `Computed vitality for ${lang.ID}: ISO=${vitality.iso}, Eth2013=${vitality.ethFine}/${vitality.ethnologue2013}, Eth2025=${vitality.ethCoarse}/${vitality.ethnologue2025}, Descendants: ${descendants.map((d) => d.ID).join(', ')}`,
    );
  lang.vitality = vitality;
}
