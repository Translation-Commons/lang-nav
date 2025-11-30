import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { ObjectType } from '@features/params/PageParamTypes';

import { ObjectData, WikipediaData, WikipediaStatus } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const ObjectWikipediaInfo: React.FC<{ object: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;

  // If the object doesn't have a direct wikipedia, then we may be able to find the status
  // from the linked language (for locales) the logic is handled in WikipediaStatusDisplay
  if (!object.wikipedia) return <WikipediaStatusDisplay object={object} />;

  const wikipedia = object.wikipedia as WikipediaData;

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
  if (object?.type === ObjectType.Locale && !object.wikipedia) {
    if (object.language?.wikipedia) {
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
  const { wikipedia } = object;
  if (!wikipedia) return <Deemphasized>No wiki</Deemphasized>;

  return <span style={{ color: getStatusColor(wikipedia.status) }}>{wikipedia.status}</span>;
};

export const WikipediaArticles: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (object.wikipedia?.status !== WikipediaStatus.Active) return null;

  return object.wikipedia.articles.toLocaleString();
};

export const WikipediaActiveUsers: React.FC<{ object?: ObjectData }> = ({ object }) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (object.wikipedia?.status !== WikipediaStatus.Active) return null;

  return <CountOfPeople count={object.wikipedia.activeUsers} />;
};

export const WikipediaLink: React.FC<{ object?: ObjectData; showURL?: boolean }> = ({
  object,
  showURL = false,
}) => {
  if (object?.type !== ObjectType.Language && object?.type !== ObjectType.Locale) return null;
  if (!object.wikipedia) return null;

  return <LinkButton href={object.wikipedia.url}>{showURL && object.wikipedia.url}</LinkButton>;
};

function getStatusColor(status: WikipediaStatus) {
  switch (status) {
    case WikipediaStatus.Active:
      return 'var(--color-text-green)';
    case WikipediaStatus.Closed:
      return 'var(--color-text-red)';
    case WikipediaStatus.Incubator:
      return 'var(--color-text-yellow)';
  }
}

export default ObjectWikipediaInfo;
