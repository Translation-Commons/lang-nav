import React from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import LocaleIndigeneityDisplay, {
  getIndigeneityDescription,
} from '@entities/locale/localstatus/LocaleIndigeneityDisplay';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import { Badge } from '@shared/ui/badge';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import LocalePopulationSection from './sections/LocalePopulationSection';

type Props = {
  locale: LocaleData;
};

const LocaleDetails: React.FC<Props> = ({ locale }) => {
  return (
    <div className="Details">
      <LocaleDefinitionSection locale={locale} />
      <LocalePopulationSection locale={locale} />
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
    <DetailsSection title="Definition">
      <DetailsField title="Language">
        {language ? (
          <HoverableObjectName ent={language} />
        ) : (
          <span>
            {languageCode} <Deemphasized>[language not in database]</Deemphasized>
          </span>
        )}
      </DetailsField>
      {(territory || territoryCode) && (
        <DetailsField title="Territory">
          {territory ? (
            <HoverableObjectName ent={territory} />
          ) : (
            <span>
              {territoryCode} <Deemphasized>[territory not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
      {scriptCode && (
        <DetailsField title="Writing System">
          {writingSystem ? (
            <HoverableObjectName ent={writingSystem} />
          ) : (
            <span>
              {scriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
      {!scriptCode && language?.primaryWritingSystem && (
        <DetailsField title="Writing System">
          <HoverableObjectName ent={language?.primaryWritingSystem} />{' '}
          <Hoverable
            hoverContent={
              <>
                The locale does not include an explicit writing system code. Depending on the
                context it may mean there is no specific writing system (this locale refers to any).
                In practice in most IT systems it assumes the primary writing system for the
                language <HoverableObjectName ent={language} />.
              </>
            }
          >
            <Badge variant="secondary">inferred</Badge>
          </Hoverable>
        </DetailsField>
      )}
      {variantCodes && variantCodes.length > 0 && (
        <DetailsField title={`Variant${variantCodes.length > 1 ? 's' : ''}`}>
          {variants ? (
            <CommaSeparated>
              {variants.map((tag) => (
                <HoverableObjectName key={tag.ID} ent={tag} />
              ))}
            </CommaSeparated>
          ) : (
            <span>
              {variantCodes.join(', ')} <Deemphasized>[variant not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
    </DetailsSection>
  );
};

const LocaleOtherSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { officialStatus, wikipedias, localeSource, relatedLocales } = locale;
  return (
    <DetailsSection title="Other">
      {officialStatus && (
        <DetailsField title="Government Status">{getOfficialLabel(officialStatus)}</DetailsField>
      )}
      <DetailsField title="Indigeneity" description={getIndigeneityDescription()}>
        <LocaleIndigeneityDisplay loc={locale} />
      </DetailsField>
      {wikipedias && wikipedias.length > 0 && (
        <DetailsField title="Wikipedia">
          <ObjectWikipediaInfo ent={locale} />
        </DetailsField>
      )}
      <DetailsField title="Locale Source">
        <LocaleSourceLabel localeSource={localeSource} />
      </DetailsField>
      {relatedLocales?.moreGeneral && relatedLocales.moreGeneral.length > 0 && (
        <DetailsField title="More General Locales">
          <CommaSeparated>
            {relatedLocales.moreGeneral.map((locale) => (
              <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.moreSpecific && relatedLocales.moreSpecific.length > 0 && (
        <DetailsField title="More Specific Locales">
          <CommaSeparated>
            {relatedLocales.moreSpecific.map((locale) => (
              <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.parentLanguage && (
        <DetailsField title="Parent Language Locale">
          <HoverableObjectName ent={relatedLocales.parentLanguage} labelSource="code" />
        </DetailsField>
      )}
      {relatedLocales?.childLanguages && relatedLocales.childLanguages.length > 0 && (
        <DetailsField title="Child Language Locales">
          <CommaSeparated>
            {relatedLocales.childLanguages.map((locale) => (
              <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.parentTerritory && (
        <DetailsField title="Encapsulating Territory Locale">
          <HoverableObjectName ent={relatedLocales.parentTerritory} labelSource="code" />
        </DetailsField>
      )}
      {relatedLocales?.childTerritories && relatedLocales.childTerritories.length > 0 && (
        <DetailsField title="Contained Territory Locales">
          <CommaSeparated>
            {relatedLocales.childTerritories.map((locale) => (
              <HoverableObjectName key={locale.ID} ent={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
    </DetailsSection>
  );
};

const LocaleSourceLabel: React.FC<{ localeSource: LocaleSource }> = ({ localeSource }) => {
  switch (localeSource) {
    case LocaleSource.StableDatabase:
      return 'Regular Database locale.tsv Input';
    case LocaleSource.IANA:
      return 'IANA Language Tag Registry';
    case LocaleSource.Census:
      return 'Census Record';
    case LocaleSource.CreateRegionalLocales:
      return 'Generated by adding up locales inside countries';
  }
};

export default LocaleDetails;
