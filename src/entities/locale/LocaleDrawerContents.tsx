import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import EntityWikipediaInfo from '@entities/ui/EntityWikipediaInfo';

import { Badge } from '@shared/ui/badge';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLocaleSourceLabel } from '@strings/LocaleSourceStrings';

import LocaleDrawerPopulation from './LocaleDrawerPopulation';
import { getOfficialLabel } from './LocaleStrings';
import { LocaleData } from './LocaleTypes';
import LocaleIndigeneityDisplay from './localstatus/LocaleIndigeneityDisplay';

type Props = {
  locale: LocaleData;
};

const LocaleDrawerContents: React.FC<Props> = ({ locale }) => {
  return (
    <div className="flex flex-col gap-3">
      <LocaleDefinitionSection locale={locale} />
      <LocaleDrawerPopulation locale={locale} />
      <LocaleOtherSection locale={locale} />
    </div>
  );
};

const LocaleDefinitionSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    scriptCode,
    language,
    languageCode,
    territory,
    territoryCode,
    variants,
    variantCodes,
    writingSystem,
  } = locale;

  return (
    <DrawerDetailsSection title="Definition">
      <DrawerDetailsField label="Language" hasData={!!language}>
        {language && <HoverableEntityName ent={language} />}
        {!language && languageCode && <span>{languageCode} [language not in database]</span>}
      </DrawerDetailsField>
      {(scriptCode || language?.primaryWritingSystem) && (
        <DrawerDetailsField
          label="Writing System"
          hasData={!!writingSystem || !!language?.primaryWritingSystem}
        >
          {writingSystem && <HoverableEntityName ent={writingSystem} />}
          {!writingSystem && scriptCode && (
            <span>{scriptCode} [writing system not in database]</span>
          )}
          {!writingSystem && !scriptCode && language?.primaryWritingSystem && (
            <span className="inline-flex items-center gap-1">
              <HoverableEntityName ent={language?.primaryWritingSystem} />
              <Badge variant="secondary">Inferred</Badge>
            </span>
          )}
        </DrawerDetailsField>
      )}
      {territoryCode && (
        <DrawerDetailsField label="Territory" hasData={!!territory}>
          {territory && <HoverableEntityName ent={territory} />}
          {!territory && territoryCode && <span>{territoryCode} [territory not in database]</span>}
        </DrawerDetailsField>
      )}

      {variantCodes && variantCodes.length > 0 && (
        <DrawerDetailsField label={`Variant${variantCodes.length > 1 ? 's' : ''}`}>
          {variants ? (
            <CommaSeparated>
              {variants.map((tag) => (
                <HoverableEntityName key={tag.ID} ent={tag} />
              ))}
            </CommaSeparated>
          ) : (
            <span>
              {variantCodes.join(', ')} <Deemphasized>[variant not in database]</Deemphasized>
            </span>
          )}
        </DrawerDetailsField>
      )}
    </DrawerDetailsSection>
  );
};

const LocaleOtherSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { officialStatus, wikipedias, localeSource } = locale;
  return (
    <DrawerDetailsSection title="Other">
      {officialStatus && (
        <DrawerDetailsField label="Government Status">
          {getOfficialLabel(officialStatus)}
        </DrawerDetailsField>
      )}
      <DrawerDetailsField label="Indigeneity">
        <LocaleIndigeneityDisplay loc={locale} />
      </DrawerDetailsField>
      {wikipedias && wikipedias.length > 0 && (
        <DrawerDetailsField label="Wikipedia">
          <EntityWikipediaInfo ent={locale} />
        </DrawerDetailsField>
      )}
      <DrawerDetailsField label="Locale Source">
        {getLocaleSourceLabel(localeSource)}
      </DrawerDetailsField>
    </DrawerDetailsSection>
  );
};

export default LocaleDrawerContents;
