import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { getFilterByLanguageScope } from '@features/transforms/filtering/filter';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const LocalesInTerritoryCard: React.FC<Props> = ({ territory }) => {
  const [showAll, setShowAll] = React.useState(false);
  const filterByLanguageScope = getFilterByLanguageScope();

  const locales = (territory.locales ?? []).filter(filterByLanguageScope).sort(sortByPopulation);
  return (
    <div>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>
        Locales in <HoverableObjectName object={territory} />
      </h3>
      <>
        Click to see a table with all languages and locales for this territory available in LangNav.{' '}
        {locales.length === 0 && 'There are no languages in this territory.'}
        {locales.length === 1 &&
          `There is 1 ${locales[0].language?.scope ?? 'language'} in this territory:`}
        {locales.length > 1 && `There are ${locales.length} languages in this territory:`}
      </>
      {locales.slice(0, showAll ? locales.length : 5).map((locale) => (
        <div key={locale.ID} style={{ marginLeft: '1em' }}>
          <HoverableObjectName object={locale} labelSource="locale without territory" /> [
          {locale.codeDisplay}]
        </div>
      ))}
      {locales.length > 5 && (
        <div style={{ marginLeft: '1em' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ padding: '0.25em' }}>
            {showAll ? 'show less' : `+${locales.length - 5} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocalesInTerritoryCard;
