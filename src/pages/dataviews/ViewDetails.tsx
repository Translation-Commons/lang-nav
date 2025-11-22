import React, { PropsWithChildren, ReactNode } from 'react';

import ObjectDetails from '@widgets/details/ObjectDetails';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import getObjectFromID from '@entities/lib/getObjectFromID';
import ObjectSuggestions from '@entities/ui/ObjectSuggestions';
import ObjectTitle from '@entities/ui/ObjectTitle';

const ViewDetails: React.FC = () => {
  const { objectType } = usePageParams();
  const object = getObjectFromID();

  if (object == null) {
    const suggestionsByObjectType = Object.values(ObjectType).reduce(
      (acc, type) => {
        acc[type] = <ObjectSuggestions objectType={type} />;
        return acc;
      },
      {} as Record<ObjectType, React.ReactNode>,
    );

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

export default ViewDetails;
