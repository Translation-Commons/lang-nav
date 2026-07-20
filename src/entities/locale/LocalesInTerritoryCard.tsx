import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { Button } from '@shared/ui/button';

type Props = {
  territory: TerritoryData;
};

const LocalesInTerritoryCard: React.FC<Props> = ({ territory }) => {
  const [showAll, setShowAll] = React.useState(false);
  const locales = useFilteredEntities({ inputEntities: territory.locales }).filteredEntities;

  return (
    <div>
      <h3 className="font-bold mb-1">
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
        <div key={locale.ID} className="ml-4">
          <HoverableObjectName object={locale} labelSource="locale without territory" /> [
          {locale.codeDisplay}]
        </div>
      ))}
      {locales.length > 5 && (
        <div className="ml-4">
          <Button variant="link" size="xs" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'show less' : `+${locales.length - 5} more`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocalesInTerritoryCard;
