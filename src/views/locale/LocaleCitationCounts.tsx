import React from 'react';

/*
 * This report summarizes how many locales have population citations from census records.
 *
 * A locale can optionally have a `populationCensus` field which refers back to a census record
 * that was used when computing its population estimate.  When this field is non‑null it means
 * that we have a precise citation for the population value, rather than a fallback from other
 * sources.  This component counts how many locales currently in scope (respecting any scope
 * filters set by the user) have a non‑null `populationCensus` and reports that number.  It is
 * intended to appear on the locale Reports page alongside other locale metrics.
 */

import { useDataContext } from '../../data/DataContext';
import { getScopeFilter } from '../../controls/filter';
import CollapsibleReport from '../common/CollapsibleReport';

/**
 * A simple report that counts locales with population census citations.
 */
const LocaleCitationCounts: React.FC = () => {
  const { locales } = useDataContext();
  const filterByScope = getScopeFilter();
  // Collect locales matching current filters
  const filteredLocales = Object.values(locales).filter(filterByScope);
  // Count those locales that have a non-null populationCensus
  const withCensusCount = filteredLocales.filter((loc) => loc.populationCensus != null).length;
  const totalLocales = filteredLocales.length;

  return (
    <CollapsibleReport title={`Locales with census citations (${withCensusCount})`}>
      <p>
        Of the {totalLocales} locales currently in scope, {withCensusCount} have population
        estimates derived from a census record.  These locales have a non‑null&nbsp;
        <code>populationCensus</code> field which links back to the underlying census, providing
        a verifiable source for the population value.
      </p>
    </CollapsibleReport>
  );
};

export default LocaleCitationCounts;
