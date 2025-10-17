import React, { PropsWithChildren, ReactNode } from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import CensusSuggestions from '@entities/census/CensusSuggestions';
import LanguageSuggestions from '@entities/language/LanguageSuggestions';
import getObjectFromID from '@entities/lib/getObjectFromID';
import LocaleSuggestions from '@entities/locale/LocaleSuggestions';
import TerritorySuggestions from '@entities/territory/TerritorySuggestions';
import ObjectTitle from '@entities/ui/ObjectTitle';
import VariantTagSuggestions from '@entities/varianttag/VariantTagSuggestions';
import WritingSystemSuggestions from '@entities/writingsystem/WritingSystemSuggestions';

import ObjectDetails from './ObjectDetails';

const ObjectDetailsPage: React.FC = () => {
  const { objectType } = usePageParams();
  const object = getObjectFromID();

  if (object == null) {
    const suggestionsByObjectType = {
      [ObjectType.Census]: <CensusSuggestions />,
      [ObjectType.Language]: <LanguageSuggestions />,
      [ObjectType.Locale]: <LocaleSuggestions />,
      [ObjectType.Territory]: <TerritorySuggestions />,
      [ObjectType.WritingSystem]: <WritingSystemSuggestions />,
      [ObjectType.VariantTag]: <VariantTagSuggestions />,
    };

    return (
      <DetailsContainer title={objectType + ' Details'}>
        This page shows details about a particular {objectType} or other related entity. Use the
        search bar in the page or another view to find one. Here are some suggestions:
        <div style={{ marginBottom: '2em' }}>{suggestionsByObjectType[objectType]}</div>
        Or try another object type, for example:
        {Object.entries(suggestionsByObjectType)
          .filter(([dim]) => dim !== objectType)
          .map(([dim, suggestions]) => (
            <div key={dim} style={{ marginBottom: '1em' }}>
              <label>{dim}</label>
              {suggestions}
            </div>
          ))}
      </DetailsContainer>
    );
  }

  return (
    <DetailsContainer title={<ObjectTitle object={object} />}>
      <ObjectDetails object={object} />
    </DetailsContainer>
  );
};

export const DetailsContainer: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({
  children,
  title,
}) => {
  return (
    <div style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'start' }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default ObjectDetailsPage;
