import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { CensusCollectorType } from '@entities/census/CensusTypes';

import CollapsibleReport from '@shared/containers/CollapsibleReport';

const LocaleCitationCounts: React.FC = () => {
  const { locales } = useDataContext();
  const filterByScope = getScopeFilter();
  const filteredLocales = locales.filter(filterByScope);

  // Count locales with populationCensus
  const withCensusLocales = filteredLocales.filter((loc) => loc.populationCensus != null);
  const totalLocales = filteredLocales.length;
  const withCensusCount = withCensusLocales.length;
  const citationPercent = totalLocales > 0 ? Math.round((withCensusCount / totalLocales) * 100) : 0;

  // Breakdown by collectorType: Government, CLDR, Study, Other
  const breakdown = withCensusLocales.reduce(
    (acc, loc) => {
      const collector = loc.populationCensus?.collectorType;
      if (collector != null) {
        acc[collector] = (acc[collector] ?? 0) + 1;
      } else {
        acc.other = (acc.other ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  const govCount = breakdown[CensusCollectorType.Government] ?? 0;
  const cldrCount = breakdown[CensusCollectorType.CLDR] ?? 0;
  const studyCount = breakdown[CensusCollectorType.Study] ?? 0;
  const otherCount = withCensusCount - govCount - cldrCount - studyCount;

  // Group by language scope and territory scope
  const langScopeGroups: Record<string, { total: number; withCensus: number }> = {};
  const terrScopeGroups: Record<string, { total: number; withCensus: number }> = {};
  filteredLocales.forEach((loc) => {
    const langScope = loc.language?.scope ?? 'Unknown';
    if (!langScopeGroups[langScope]) langScopeGroups[langScope] = { total: 0, withCensus: 0 };
    langScopeGroups[langScope].total++;
    if (loc.populationCensus != null) langScopeGroups[langScope].withCensus++;

    const terrScope = loc.territory?.scope ?? 'Unknown';
    if (!terrScopeGroups[terrScope]) terrScopeGroups[terrScope] = { total: 0, withCensus: 0 };
    terrScopeGroups[terrScope].total++;
    if (loc.populationCensus != null) terrScopeGroups[terrScope].withCensus++;
  });

  return (
    <CollapsibleReport title={`Locales with census citations (${withCensusCount})`}>
      <p>
        {citationPercent}% ({withCensusCount}/{totalLocales}) of the locales currently in scope have
        population estimates derived from a census record. These locales have a non‑null&nbsp;
        <code>populationCensus</code> field which links back to the underlying census, providing a
        verifiable source for the population value.
      </p>

      {/* Census source breakdown */}
      <div style={{ marginBottom: '1em' }}>
        <strong>Census source breakdown:</strong>
        <ul>
          <li>
            Government: {govCount} (
            {withCensusCount > 0 ? ((govCount / withCensusCount) * 100).toFixed(1) : '0'}
            %)
          </li>
          <li>
            CLDR: {cldrCount} (
            {withCensusCount > 0 ? ((cldrCount / withCensusCount) * 100).toFixed(1) : '0'}
            %)
          </li>
          {studyCount > 0 && (
            <li>
              Study: {studyCount} (
              {withCensusCount > 0 ? ((studyCount / withCensusCount) * 100).toFixed(1) : '0'}
              %)
            </li>
          )}
          {otherCount > 0 && (
            <li>
              Other: {otherCount} (
              {withCensusCount > 0 ? ((otherCount / withCensusCount) * 100).toFixed(1) : '0'}
              %)
            </li>
          )}
        </ul>
      </div>

      {/* Breakdown by language scope */}
      <div style={{ marginBottom: '1em' }}>
        <strong>Breakdown by language scope:</strong>
        <ul>
          {Object.entries(langScopeGroups).map(([scope, counts]) => {
            const percent =
              counts.total > 0 ? ((counts.withCensus / counts.total) * 100).toFixed(1) : '0';
            return (
              <li key={scope}>
                {scope}: {percent}% ({counts.withCensus}/{counts.total})
              </li>
            );
          })}
        </ul>
      </div>

      {/* Breakdown by territory scope */}
      <div>
        <strong>Breakdown by territory scope:</strong>
        <ul>
          {Object.entries(terrScopeGroups).map(([scope, counts]) => {
            const percent =
              counts.total > 0 ? ((counts.withCensus / counts.total) * 100).toFixed(1) : '0';
            return (
              <li key={scope}>
                {scope}: {percent}% ({counts.withCensus}/{counts.total})
              </li>
            );
          })}
        </ul>
      </div>
    </CollapsibleReport>
  );
};

export default LocaleCitationCounts;
