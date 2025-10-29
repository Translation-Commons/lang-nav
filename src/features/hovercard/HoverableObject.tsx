import React, { useCallback } from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import { ObjectType, PageParamsOptional, View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import CensusCard from '@entities/census/CensusCard';
import LanguageCard from '@entities/language/LanguageCard';
import LocaleCard from '@entities/locale/LocaleCard';
import TerritoryCard from '@entities/territory/TerritoryCard';
import { ObjectData } from '@entities/types/DataTypes';
import VariantTagCard from '@entities/varianttag/VariantTagCard';
import WritingSystemCard from '@entities/writingsystem/WritingSystemCard';

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
  const onClick = useCallback(() => {
    const params: PageParamsOptional = { objectID: object.ID };
    if (view === View.Details) params.objectType = object.type;
    updatePageParams(params);
  }, [object, updatePageParams, view]);

  return (
    <Hoverable
      hoverContent={
        <>
          Click to{' '}
          {view === View.Details
            ? 'change page to see the details for:'
            : 'open modal with more information for:'}
          <div>
            <strong>{object.type}</strong>
          </div>
          {getHoverContent()}
        </>
      }
      onClick={onClick}
      style={style}
    >
      {children}
    </Hoverable>
  );
};

export default HoverableObject;
