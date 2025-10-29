import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import { ObjectType } from '@features/page-params/PageParamTypes';

import { ObjectData, WikipediaData, WikipediaStatus } from '@entities/types/DataTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';

const ObjectWikipediaInfo: React.FC<{ object: ObjectData; size?: 'normal' | 'compact' }> = ({
  object,
  size = 'normal',
}) => {
  if (!(object.type === ObjectType.Language || object.type === ObjectType.Locale)) {
    return null;
  }

  if (!object.wikipedia) {
    // Locales often don't have specific Wikipedias, but their language may
    if (object.type === ObjectType.Locale) {
      const language = object.language;
      if (language?.wikipedia) {
        return (
          <>
            <span style={{ color: getStatusColor(language.wikipedia.status) }}>
              {language.wikipedia.status}
            </span>{' '}
            (see <HoverableObjectName object={language} />)
          </>
        );
      }
    }

    return <Deemphasized>No Wikipedia</Deemphasized>;
  }

  const wikipedia = object.wikipedia as WikipediaData;

  return (
    <>
      <span style={{ color: getStatusColor(wikipedia.status) }}>{wikipedia.status}</span>
      {wikipedia.status === WikipediaStatus.Active && (
        <>
          {': '}
          {wikipedia.articles.toLocaleString()} articles
          {size === 'normal' && `, ${wikipedia.activeUsers.toLocaleString()} active users`}
        </>
      )}
      <LinkButton href={wikipedia.url}>{size === 'normal' ? wikipedia.url : ''}</LinkButton>
    </>
  );
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
