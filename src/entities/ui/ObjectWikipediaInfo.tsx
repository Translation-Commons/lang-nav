import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData, WikipediaData, WikipediaStatus } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/old/CountOfPeople';
import Deemphasized from '@shared/ui/old/Deemphasized';
import LinkButton from '@shared/ui/old/LinkButton';

const ObjectWikipediaInfo: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;

  // If the object doesn't have a direct wikipedia, then we may be able to find the status
  // from the linked language (for locales) the logic is handled in WikipediaStatusDisplay
  if (!object.wikipedias || object.wikipedias.length === 0)
    return <WikipediaStatusDisplay object={object} />;

  const wikipedia = object.wikipedias[0] as WikipediaData;

  return (
    <>
      <WikipediaStatusDisplay object={object} />
      {wikipedia.status === WikipediaStatus.Active && (
        <>
          {': '}
          <WikipediaArticles object={object} /> articles, <WikipediaActiveUsers object={object} />{' '}
          active users
        </>
      )}
    </>
  );
};

export const WikipediaStatusDisplay: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (
    object?.type === ObjectType.Locale &&
    (!object.wikipedias || object.wikipedias.length === 0)
  ) {
    if (object.language?.wikipedias && object.language.wikipedias.length > 0) {
      return (
        <>
          <WikipediaStatusDisplay object={object.language} /> (see{' '}
          <HoverableObjectName object={object.language} labelSource="code" />)
        </>
      );
    }
    return null;
  }
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  const { wikipedias } = object;
  if (!wikipedias || wikipedias.length === 0) return <Deemphasized>No wiki</Deemphasized>;

  return <span className={getStatusColorClass(wikipedias[0].status)}>{wikipedias[0].status}</span>;
};

export const WikipediaArticles: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (!object.wikipedias || object.wikipedias.length === 0) return null;
  if (object.wikipedias[0].status !== WikipediaStatus.Active) return null;

  return object.wikipedias[0].articles.toLocaleString();
};

export const WikipediaActiveUsers: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (!object.wikipedias || object.wikipedias.length === 0) return null;
  if (object.wikipedias[0].status !== WikipediaStatus.Active) return null;

  return <CountOfPeople count={object.wikipedias[0].activeUsers} />;
};

export const WikipediaLink: React.FC<{ object?: ObjectData; showURL?: boolean }> = ({
  object,
  showURL = false,
}) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (!object.wikipedias || object.wikipedias.length === 0) return null;

  return (
    <LinkButton href={`https://${object.wikipedias[0].url}`}>
      {showURL && object.wikipedias[0].url}
    </LinkButton>
  );
};

export function getStatusColorClass(status: WikipediaStatus) {
  switch (status) {
    case WikipediaStatus.Active:
      return 'text-green';
    case WikipediaStatus.Closed:
      return 'text-red';
    case WikipediaStatus.Incubator:
      return 'text-yellow';
  }
}

export default ObjectWikipediaInfo;
