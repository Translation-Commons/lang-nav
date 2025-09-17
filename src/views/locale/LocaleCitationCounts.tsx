import React from 'react';

import { getScopeFilter } from '../../controls/filter';
import { useDataContext } from '../../data/DataContext';
import { CensusCollectorType } from '../../types/CensusTypes';
import CollapsibleReport from '../common/CollapsibleReport';

const LocaleCitationCounts: React.FC = () => {
  const { locales } = useDataContext();
  const filterByScope = getScopeFilter();
  const filteredLocales = Object.values(locales).filter(filterByScope);

  // Count locales with populationCensus
  const withCensusLocales = filteredLocales.filter((loc) => loc.populationCensus != null);
  const totalLocales = filteredLocales.length;
  const withCensusCount = withCensusLocales.length;
  const citationPercent = totalLocales > 0 ? Math.round((withCensusCount / totalLocales) * 100) : 0;

  // Breakdown by collectorType: Government, CLDR, Study, Other
  const citationsByCollectorType = withCensusLocales.reduce(
    (acc, loc) => {
      const collector = loc.populationCensus?.collectorType;
      if (collector != null) {
        acc[collector] = (acc[collector] ?? 0) + 1;
      } // locales without citations not counted
      return acc;
    },
    {} as Record<CensusCollectorType, number>,
  );
  // Group by language scope and territory scope
  const citationsByLangScope: Record<LanguageScope, { total: number; withCensus: number }> =
    Object.fromEntries(
      Object.values(LanguageScope).map((scope) => [scope, { total: 0, withCensus: 0 }]),
    ) as Record<LanguageScope, { total: number; withCensus: number }>;
  const citationsByTerrScope: Record<TerritoryScope, { total: number; withCensus: number }> =
    Object.fromEntries(
      Object.values(TerritoryScope).map((scope) => [scope, { total: 0, withCensus: 0 }]),
    ) as Record<TerritoryScope, { total: number; withCensus: number }>;
  filteredLocales.forEach((loc) => {
    const langScope = loc.language?.scope;
    if (langScope) {
      citationsByLangScope[langScope].total++;
      if (loc.populationCensus != null) citationsByLangScope[langScope].withCensus++;
    }

    const terrScope = loc.territory?.scope;
    if (terrScope) {
      citationsByTerrScope[terrScope].total++;
      if (loc.populationCensus != null) citationsByTerrScope[terrScope].withCensus++;
    }
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
          {Object.entries(citationsByCollectorType).map(([type, count]) => {
            const percent =
              withCensusCount > 0 ? ((count / withCensusCount) * 100).toFixed(1) : '0';
            return (
              <li key={type}>
                {type}: {percent}% ({count}/{withCensusCount})
              </li>
            );
          })}
        </ul>
      </div>

      {/* Breakdown by language scope */}
      <div style={{ marginBottom: '1em' }}>
        <strong>Percent of locales with citations by language scope:</strong>
        <ul>
          {Object.entries(langScopeGroups).map(([scope, counts]) => {
            if (counts.total === 0) return null;
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
        <strong>Percent of locales with citations by territory scope:</strong>
        <ul>
          {Object.entries(terrScopeGroups).map(([scope, counts]) => {
            if (counts.total === 0) return null;
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
