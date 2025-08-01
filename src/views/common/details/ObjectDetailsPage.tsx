import React, { PropsWithChildren, ReactNode, useEffect } from 'react';

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
  const { objectType, updatePageParams } = usePageParams();
  const object = getObjectFromID();

  useEffect(() => {
    if (object?.type != null) updatePageParams({ objectType: object?.type });
  }, [object?.type]);

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
      <DetailsContainer title="Details">
        This view shows details about a particular object -- but no object has been specified. Use
        another view (Card List, Hierarchy, Table) to find one or click on one of the suggestions
        below:
        <div style={{ marginBottom: '2em' }}>
          <label>{objectType}</label>
          {suggestionsByObjectType[objectType]}
        </div>
        Or try another object type:
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

const DetailsContainer: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({
  children,
  title,
}) => {
  return (
    <div
      style={{
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'start',
      }}
    >
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default ObjectDetailsPage;
