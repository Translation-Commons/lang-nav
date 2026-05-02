import React from 'react';

import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';

import { UniversalDeclarationOfHumanRightsData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import ExternalLink from '@shared/ui/ExternalLink';

import { LanguageData, LanguageScope } from '../LanguageTypes';

export const LanguageUDHRDescription =
  'The Universal Declaration of Human Rights has been translated into over 500 languages. This shows the number of translations available for this language, and links to them.';

const LanguageUDHRInfo: React.FC<{ lang: LanguageData; size: 'long' | 'short' }> = ({
  lang,
  size,
}) => {
  if (!lang.udhr || lang.udhr.length === 0) {
    if (lang.scope === LanguageScope.Macrolanguage || lang.scope === LanguageScope.Language)
      return <Deemphasized>{size === 'long' ? 'No translation available' : 'None'}</Deemphasized>;
    return <Deemphasized>-</Deemphasized>;
  }

  if (size === 'short') {
    return (
      <HoverableEnumeration
        items={lang.udhr.map((udhrEntry) => (
          <LanguageUDHRLink key={udhrEntry.name} udhrEntry={udhrEntry} />
        ))}
      />
    );
  }

  return (
    <div>
      {lang.udhr.length.toLocaleString()} translation{lang.udhr.length > 1 ? 's' : ''}:{' '}
      <CommaSeparated>
        {lang.udhr.map((udhrEntry) => (
          <LanguageUDHRLink key={udhrEntry.name} udhrEntry={udhrEntry} />
        ))}
      </CommaSeparated>
    </div>
  );
};

const LanguageUDHRLink = ({ udhrEntry }: { udhrEntry: UniversalDeclarationOfHumanRightsData }) => {
  return (
    <ExternalLink
      key={udhrEntry.name}
      href={
        udhrEntry.documentURL.startsWith('https://')
          ? udhrEntry.documentURL
          : `https://www.ohchr.org/en/human-rights/universal-declaration/translations/${udhrEntry.documentURL}`
      }
    >
      {udhrEntry.name}
    </ExternalLink>
  );
};

export default LanguageUDHRInfo;
