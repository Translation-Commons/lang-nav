import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LanguageScope } from '@entities/language/LanguageTypes';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { LocalePopulationAdjusted } from '@entities/locale/LocalePopulationAdjusted';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, LocaleSource } from '@entities/types/DataTypes';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';
import { PercentageDifference } from '@shared/ui/PercentageDifference';
import Pill from '@shared/ui/Pill';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

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
    variantTags,
    variantTagCodes,
    writingSystem,
  } = locale;

  return (
    <DetailsSection title="Definition">
      <DetailsField title="Language:">
        {language ? (
          <>
            <HoverableObjectName object={language} />
            {language.scope !== LanguageScope.Language &&
              ` (${getLanguageScopeLabel(language.scope)})`}
          </>
        ) : (
          <span>
            {languageCode} <Deemphasized>[language not in database]</Deemphasized>
          </span>
        )}
      </DetailsField>
      {(territory || territoryCode) && (
        <DetailsField title="Territory:">
          {territory ? (
            <HoverableObjectName object={territory} />
          ) : (
            <span>
              {territoryCode} <Deemphasized>[territory not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
      {scriptCode && (
        <DetailsField title="Writing System:">
          {writingSystem ? (
            <HoverableObjectName object={writingSystem} />
          ) : (
            <span>
              {scriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
      {!scriptCode && language?.primaryWritingSystem && (
        <DetailsField title="Writing System:">
          <HoverableObjectName object={language?.primaryWritingSystem} />{' '}
          <Hoverable
            hoverContent={
              <>
                The locale does not include an explicit writing system code. Depending on the
                context it may mean there is no specific writing system (this locale refers to any).
                In practice in most IT systems it assumes the primary writing system for the
                language <HoverableObjectName object={language} />.
              </>
            }
          >
            <Pill>inferred</Pill>
          </Hoverable>
        </DetailsField>
      )}
      {variantTagCodes && variantTagCodes.length > 0 && (
        <DetailsField title={`Variant Tag${variantTagCodes.length > 1 ? 's' : ''}:`}>
          {variantTags ? (
            <CommaSeparated>
              {variantTags.map((tag) => (
                <HoverableObjectName key={tag.ID} object={tag} />
              ))}
            </CommaSeparated>
          ) : (
            <span>
              {variantTagCodes.join(', ')} <Deemphasized>[variant not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
    </DetailsSection>
  );
};

const LocalePopulationSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    censusRecords,
    populationAdjusted,
    populationSpeaking,
    populationSpeakingPercent,
    populationWriting,
    populationWritingPercent,
    territory,
  } = locale;

  return (
    <DetailsSection title="Population">
      {populationSpeaking == null && <Deemphasized>No population data available.</Deemphasized>}

      {populationAdjusted && (
        <DetailsField title="Population Adjusted to 2025:">
          <LocalePopulationAdjusted locale={locale} />
        </DetailsField>
      )}

      {populationSpeaking != null && (
        <DetailsField title="Speakers:">
          <CountOfPeople count={populationSpeaking} />
          {' ['}
          <LocaleCensusCitation locale={locale} />
          {']'}
        </DetailsField>
      )}
      {populationSpeakingPercent != null && (
        <DetailsField
          title={
            <span style={{ marginLeft: '2em' }}>
              % in {territory?.scope.toLowerCase() ?? 'territory'}:
            </span>
          }
        >
          {numberToFixedUnlessSmall(populationSpeakingPercent)}%
        </DetailsField>
      )}
      {populationWriting != null && territory && (
        <DetailsField title="Writers:">
          ~<CountOfPeople count={populationWriting} />
          {' [previous estimate * literacy'}
          {territory.literacyPercent != null && ` (${territory.literacyPercent.toFixed(1)}%)`}
          {']'}
        </DetailsField>
      )}
      {populationWritingPercent != null && (
        <DetailsField
          title={
            <span style={{ marginLeft: '2em' }}>
              % in {territory?.scope.toLowerCase() ?? 'territory'}:
            </span>
          }
        >
          {numberToFixedUnlessSmall(populationWritingPercent)}%
        </DetailsField>
      )}

      {censusRecords && censusRecords.length > 0 && (
        <DetailsField title="Other Censuses:">
          <table style={{ marginLeft: '2em', borderSpacing: '1em 0' }}>
            <thead>
              <tr>
                <th>Population</th>
                <th>Percent</th>
                <th>Census</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {censusRecords
                .sort((a, b) => b.populationPercent - a.populationPercent)
                .map((censusEstimate) => (
                  <tr key={censusEstimate.census.ID}>
                    <td style={{ textAlign: 'right' }}>
                      <CountOfPeople count={censusEstimate.populationEstimate} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <DecimalNumber num={censusEstimate.populationPercent} />%
                    </td>
                    <td>
                      <HoverableObjectName object={censusEstimate.census} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <PercentageDifference
                        percentNew={censusEstimate.populationPercent}
                        percentOld={populationSpeakingPercent}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </DetailsField>
      )}
    </DetailsSection>
  );
};

const LocaleOtherSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    officialStatus,
    wikipedia,
    localeSource,
    localesWithinThisLanguage,
    localesWithinThisTerritory,
  } = locale;
  return (
    <DetailsSection title="Other">
      {officialStatus && (
        <DetailsField title="Government Status:">{getOfficialLabel(officialStatus)}</DetailsField>
      )}
      {wikipedia && (
        <DetailsField title="Wikipedia:">
          <ObjectWikipediaInfo object={locale} />
        </DetailsField>
      )}
      {localesWithinThisTerritory && localesWithinThisTerritory.length > 0 && (
        <DetailsField title="Constituent Locales in Territory:">
          <CommaSeparated>
            {localesWithinThisTerritory.map((loc) => (
              <HoverableObjectName key={loc.ID} object={loc} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {localesWithinThisLanguage && localesWithinThisLanguage.length > 0 && (
        <DetailsField
          title={`Constituent Locales in ${getLanguageScopeLabel(locale.language?.scope)}:`}
        >
          <CommaSeparated>
            {localesWithinThisLanguage.map((loc) => (
              <HoverableObjectName key={loc.ID} object={loc} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      <DetailsField title="Locale Source:">
        <LocaleSourceLabel localeSource={localeSource} />
      </DetailsField>
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
    case LocaleSource.CreateFamilyLocales:
      return "Generated by combining locales into new ones by their language's language families";
  }
};

export default LocaleDetails;
