import React, { PropsWithChildren, ReactNode } from 'react';

import { usePageParams } from '../../../controls/PageParamsContext';
import { ObjectType } from '../../../types/PageParamTypes';
import CensusSuggestions from '../../census/CensusSuggestions';
import LanguageSuggestions from '../../language/LanguageSuggestions';
import LocaleSuggestions from '../../locale/LocaleSuggestions';
import TerritorySuggestions from '../../territory/TerritorySuggestions';
import VariantTagSuggestions from '../../varianttag/VariantTagSuggestions';
import WritingSystemSuggestions from '../../writingsystem/WritingSystemSuggestions';
import getObjectFromID from '../getObjectFromID';
import ObjectTitle from '../ObjectTitle';

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
