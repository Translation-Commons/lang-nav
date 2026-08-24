import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { EntityType } from '@features/params/PageParamTypes';

import {
  WikipediaData,
  WikipediaStatus,
} from '@entities/language/digitalsupport/DigitalSupportTypes';
import { EntityData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const ObjectWikipediaInfo: React.FC<{ ent: EntityData }> = ({ ent }) => {
  if (ent?.type !== EntityType.Language && ent?.type !== EntityType.Locale) return null;

  // If the entity doesn't have a direct wikipedia, then we may be able to find the status
  // from the linked language (for locales) the logic is handled in WikipediaStatusDisplay
  if (!ent.wikipedias || ent.wikipedias.length === 0) return <WikipediaStatusDisplay ent={ent} />;

  const wikipedia = ent.wikipedias[0] as WikipediaData;

  return (
    <>
      <WikipediaStatusDisplay ent={ent} />
      {wikipedia.status === WikipediaStatus.Active && (
        <>
          {': '}
          <WikipediaArticles ent={ent} /> articles, <WikipediaActiveUsers ent={ent} /> active users
        </>
      )}
    </>
  );
};

export const WikipediaStatusDisplay: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (ent?.type === EntityType.Locale && (!ent.wikipedias || ent.wikipedias.length === 0)) {
    if (ent.language?.wikipedias && ent.language.wikipedias.length > 0) {
      return (
        <>
          <WikipediaStatusDisplay ent={ent.language} /> (see{' '}
          <HoverableObjectName ent={ent.language} labelSource="code" />)
        </>
      );
    }
    return null;
  }
  if (ent?.type !== EntityType.Language && ent?.type !== EntityType.Locale) return null;
  const { wikipedias } = ent;
  if (!wikipedias || wikipedias.length === 0) return <Deemphasized>No wiki</Deemphasized>;

  return (
    <span style={{ color: getStatusColor(wikipedias[0].status) }}>{wikipedias[0].status}</span>
  );
};

export const WikipediaArticles: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (ent?.type !== EntityType.Language && ent?.type !== EntityType.Locale) return null;
  if (!ent.wikipedias || ent.wikipedias.length === 0) return null;
  if (ent.wikipedias[0].status !== WikipediaStatus.Active) return null;

  return ent.wikipedias[0].articles.toLocaleString();
};

export const WikipediaActiveUsers: React.FC<{ ent?: EntityData }> = ({ ent }) => {
  if (ent?.type !== EntityType.Language && ent?.type !== EntityType.Locale) return null;
  if (!ent.wikipedias || ent.wikipedias.length === 0) return null;
  if (ent.wikipedias[0].status !== WikipediaStatus.Active) return null;

  return <CountOfPeople count={ent.wikipedias[0].activeUsers} />;
};

export const WikipediaLink: React.FC<{ ent?: EntityData; showURL?: boolean }> = ({
  ent,
  showURL = false,
}) => {
  if (ent?.type !== EntityType.Language && ent?.type !== EntityType.Locale) return null;
  if (!ent.wikipedias || ent.wikipedias.length === 0) return null;

  return (
    <LinkButton href={`https://${ent.wikipedias[0].url}`}>
      {showURL && ent.wikipedias[0].url}
    </LinkButton>
  );
};

export function getStatusColor(status: WikipediaStatus) {
  switch (status) {
    case WikipediaStatus.Active:
      return 'var(--color-green)';
    case WikipediaStatus.Closed:
      return 'var(--color-red)';
    case WikipediaStatus.Incubator:
      return 'var(--color-yellow)';
  }
}

export default ObjectWikipediaInfo;
