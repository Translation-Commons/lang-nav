import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import Hoverable from '../../generic/Hoverable';
import { ObjectData } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import CensusCard from '../census/CensusCard';
import LanguageCard from '../language/LanguageCard';
import LocaleCard from '../locale/LocaleCard';
import TerritoryCard from '../territory/TerritoryCard';
import WritingSystemCard from '../writingsystem/WritingSystemCard';

type Props = {
  object: ObjectData;
  children: React.ReactNode;
};

const HoverableObject: React.FC<Props> = ({ object, children }) => {
  const { view, updatePageParams } = usePageParams();

  const getHoverContent = () => {
    switch (object.type) {
      case ObjectType.Census:
        return <CensusCard census={object} />;
      case ObjectType.Language:
        return <LanguageCard lang={object} />;
      case ObjectType.Locale:
        return <LocaleCard locale={object} />;
      case ObjectType.Territory:
        return <TerritoryCard territory={object} />;
      case ObjectType.WritingSystem:
        return <WritingSystemCard writingSystem={object} />;
    }
  };

  return (
    <Hoverable
      hoverContent={
        <>
          Click to{' '}
          {view == 'Details'
            ? 'change page to see the details for:'
            : 'open modal with more information for:'}
          <div>
            <strong>{object.type}</strong>
          </div>
          {getHoverContent()}
        </>
      }
      onClick={() => updatePageParams({ objectID: object.ID })}
    >
      {children}
    </Hoverable>
  );
};

export default HoverableObject;
