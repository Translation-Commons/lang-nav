import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import Hoverable from '../../generic/Hoverable';
import { ObjectData } from '../../types/DataTypes';
import { ObjectType, View } from '../../types/PageParamTypes';
import CensusCard from '../census/CensusCard';
import LanguageCard from '../language/LanguageCard';
import LocaleCard from '../locale/LocaleCard';
import TerritoryCard from '../territory/TerritoryCard';
import VariantTagCard from '../varianttag/VariantTagCard';
import WritingSystemCard from '../writingsystem/WritingSystemCard';

type Props = {
  object?: ObjectData;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const HoverableObject: React.FC<Props> = ({ object, children, style }) => {
  const { view, updatePageParams } = usePageParams();
  if (object == null) {
    return <>{children}</>;
  }

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
      case ObjectType.VariantTag:
        return <VariantTagCard data={object} />;
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
      onClick={() =>
        updatePageParams({
          objectType: view === View.Details ? object.type : undefined,
          objectID: object.ID,
        })
      }
      style={style}
    >
      {children}
    </Hoverable>
  );
};

export default HoverableObject;
