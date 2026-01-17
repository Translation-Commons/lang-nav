import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import { uniqueBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import LanguagePath from './LanguagePathSimple';

const LanguagePathsReport: React.FC = () => {
  const { limit, updatePageParams } = usePageParams();
  const { getLanguage, languagesInSelectedSource } = useDataContext();
  const { orphans, longestPaths, cycles, multipleRoutes } =
    getExtremeLanguagePaths(languagesInSelectedSource);
  const orphanedLanguages = orphans
    .map((langId) => getLanguage(langId))
    .filter((lang) => lang != null)
    .sort((a, b) => (b.populationEstimate ?? 0) - (a.populationEstimate ?? 0))
    .slice(0, limit);

  // A known issue for multipleRoutes is when languages have been deprecated from ISO -- they may not be matched with glottolog entries.
  // Therefore, we should split up the multipleRoutes into 2 parts, one that includes deprecated ISO languages
  const [validMultipleRoutes, deprecatedMultipleRoutes] = Object.entries(multipleRoutes).reduce<
    [Record<LanguageCode, LanguageCode[][]>, Record<LanguageCode, LanguageCode[][]>]
  >(
    (acc, [langId, paths]) => {
      const hasDeprecatedPathParent = paths.some(
        (path) => getLanguage(path[0])?.ISO.retirementReason != null,
      );
      if (hasDeprecatedPathParent) {
        acc[1][langId] = paths;
      } else {
        acc[0][langId] = paths;
      }
      return acc;
    },
    [{}, {}],
  );

  return (
    <CollapsibleReport title="Unusual Language Paths">
      This report looks at the parent/child relationships among languages to identify unusual
      patterns that may indicate data issues. See also the{' '}
      <button onClick={() => updatePageParams({ view: View.Hierarchy })}>
        Language Family Tree
      </button>{' '}
      view
      <div style={{ marginLeft: '1em', display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
        <CollapsibleReport title={`Languages with circular relationships (${cycles.length})`}>
          This shows the detected cycles in parent-child relationships among languages. Such cycles
          are usually the result of data errors, and can cause problems in tree visualizations and
          analyses that assume a strict hierarchy. The cycles detected are:
          <ul>
            {cycles.slice(0, limit).map((cycle, i) => (
              <li key={i}>
                <LanguagePath path={cycle} getLanguage={getLanguage} />
              </li>
            ))}
          </ul>
          {cycles.length == 0 && <div>No cycles detected.</div>}
        </CollapsibleReport>
        <CollapsibleReport title={`Orphaned Languages (${orphans.length})`}>
          These entries have no parent or child languages, dialects, or language families:
          <ul>
            {orphanedLanguages.map((lang) => (
              <li key={lang?.ID}>
                <HoverableObjectName object={lang} /> (
                <CountOfPeople count={lang?.populationEstimate} />)
              </li>
            ))}
          </ul>
          {orphans.length > limit && (
            <div>The list it limited to the page limit. There are {orphans.length} total.</div>
          )}
        </CollapsibleReport>
        <CollapsibleReport
          title={`Longest Language Family Paths (longest = ${longestPaths[0]?.length})`}
        >
          Showing the {longestPaths.length < limit ? longestPaths.length : 'top ' + limit} longest
          paths from root languages to leaf languages, by distinct root:
          <ol>
            {longestPaths.slice(0, limit).map((path, i) => (
              <li key={i}>
                <LanguagePath path={path} getLanguage={getLanguage} /> (length: {path.length})
              </li>
            ))}
          </ol>
        </CollapsibleReport>
        <CollapsibleReport title="Languages with multiple parent paths">
          These languages can be reached by more than one distinct path from root languages. This
          usually indicates data issues, as languages should ideally have a single lineage. The
          detected multiple paths are:
          {Object.entries(multipleRoutes).length == 0 && (
            <div>No multiple parent paths detected.</div>
          )}
          <ul>
            {Object.entries(validMultipleRoutes)
              .slice(0, limit)
              .map(([langId, paths], i) => (
                <li key={i}>
                  <strong>
                    <HoverableObjectName object={getLanguage(langId)} />
                  </strong>
                  <ul>
                    {paths.map((path, j) => (
                      <li key={j} style={{ marginLeft: '0.5em' }}>
                        <LanguagePath path={path} getLanguage={getLanguage} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
          {Object.entries(validMultipleRoutes).length == 0 && (
            <div>No multiple parent paths detected.</div>
          )}
          <ul>
            {Object.entries(deprecatedMultipleRoutes)
              .slice(0, limit)
              .map(([langId, paths], i) => (
                <li key={i}>
                  <strong>
                    <HoverableObjectName object={getLanguage(langId)} />
                  </strong>
                  <ul>
                    {paths.map((path, j) => (
                      <li key={j} style={{ marginLeft: '0.5em' }}>
                        <LanguagePath path={path} getLanguage={getLanguage} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </CollapsibleReport>
      </div>
    </CollapsibleReport>
  );
};

type ExtremeLanguagePaths = {
  orphans: LanguageCode[];
  longestPaths: LanguageCode[][]; // only the top 10 based on length
  cycles: LanguageCode[][];
  multipleRoutes: Record<LanguageCode, LanguageCode[][]>;
};

export function getExtremeLanguagePaths(languages: LanguageData[]): ExtremeLanguagePaths {
  const visitedLanguages = new Set<LanguageCode>();
  const allPaths: LanguageCode[][] = [];
  const cycles: LanguageCode[][] = [];
  const hasMultipleRoutes = new Set<LanguageCode>();

  function traverse(lang: LanguageData, path: LanguageCode[] = []) {
    const continuedPath = [...path, lang.ID];

    if (visitedLanguages.has(lang.ID)) {
      // Sometimes there are multiple paths to the same language, particularly when merging multiple data sources
      hasMultipleRoutes.add(lang.ID);
    }

    if (path.includes(lang.ID)) {
      // Cycle detected
      cycles.push(continuedPath);
      return;
    }

    visitedLanguages.add(lang.ID);
    if (lang.childLanguages == null || lang.childLanguages.length === 0) {
      // Leaf node
      allPaths.push(continuedPath);
      return;
    }

    lang.childLanguages.forEach((child) => {
      traverse(child, continuedPath);
    });
  }

  // First visit all languages without parents (they are roots of paths)
  languages.filter((lang) => !lang.parentLanguage).forEach((lang) => traverse(lang));

  // Then check over the languages for any rootless cycles
  const rootless = languages.filter((lang) => !visitedLanguages.has(lang.ID));
  rootless.forEach((lang) => {
    // Check if we have visited it already (could have been visited in a cycle)
    if (!visitedLanguages.has(lang.ID)) traverse(lang);
  });

  // Identify orphans
  const orphans: LanguageCode[] = allPaths
    .filter((path) => path.length === 1)
    .map((path) => path[0]);

  // Get top longest paths by distinct root
  const longestPaths = uniqueBy(
    allPaths.filter((path) => path.length > 1).sort((a, b) => b.length - a.length),
    (path) => path[0],
  ).slice(0, 10);

  // Find paths that contain the same language more than once (indicating multiple parent paths)
  const multipleRoutes = Object.fromEntries(
    Array.from(hasMultipleRoutes)
      .map((leafID) => {
        const pathsWithLang = allPaths
          .filter((path) => path.includes(leafID))
          .map((path) =>
            // Trim the path up to the leaf language (avoiding cases where the path continues beyond the leaf)
            path.slice(0, path.findIndex((langID) => langID === leafID) + 1),
          );
        return [leafID, uniqueBy(pathsWithLang, (path) => path.join('>'))];
      })
      .filter(([, paths]) => paths.length > 1),
  );

  return { orphans, longestPaths, cycles, multipleRoutes };
}

export default LanguagePathsReport;
