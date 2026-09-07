import React from 'react';

import { DrawerDetailsField } from '@widgets/details/ui/DrawerDetailsSection';

import { LanguageData, LanguageField, LanguageScope } from '@entities/language/LanguageTypes';

import { Badge } from '@shared/ui/badge';
import ContextIcon from '@shared/ui/ContextIcon';
import ExternalLink from '@shared/ui/ExternalLink';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { getLanguageISOStatusLabel } from '../vitality/VitalityStrings';

import LanguageRetirementReason from './LanguageRetirementReason';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerISORows: React.FC<Props> = ({ lang }) => {
  const { ISO } = lang;

  return (
    <>
      <DrawerDetailsField
        label="ISO Status"
        hasData={!!ISO.status || ISO.scope === LanguageScope.Family}
      >
        {ISO.status
          ? ISO.status
            ? getLanguageISOStatusLabel(ISO.status)
            : getLanguageScopeLabel(ISO.scope)
          : 'Not in ISO'}
        {ISO.scope && ISO.scope !== lang.scope && <Badge>{ISO.scope}</Badge>}
      </DrawerDetailsField>
      {ISO.code && (
        <DrawerDetailsField
          label="ISO code"
          actions={
            <ExternalLink href={`https://iso639-3.sil.org/code/${ISO.code}`}>
              ISO catalog
            </ExternalLink>
          }
        >
          {ISO.code}
          {ISO.code6391 && ` | ${ISO.code6391}`}
          {lang.warnings[LanguageField.isoCode] && (
            <ContextIcon severity="warning">
              <LanguageRetirementReason lang={lang} />
            </ContextIcon>
          )}
        </DrawerDetailsField>
      )}
    </>
  );
};

export default LanguageDrawerISORows;
