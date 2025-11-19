import React from 'react';

<<<<<<< HEAD:src/views/locale/LocaleDetails.tsx
import { getCldrLocale } from '../../data/cldrLocales';
import CommaSeparated from '../../generic/CommaSeparated';
import Deemphasized from '../../generic/Deemphasized';
import { numberToFixedUnlessSmall, numberToSigFigs } from '../../generic/numberUtils';
import { PercentageDifference } from '../../generic/PercentageDifference';
import { LocaleData, LocaleSource } from '../../types/DataTypes';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';
=======
import Hoverable from '@features/hovercard/Hoverable';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
>>>>>>> origin/master:src/widgets/details/LocaleDetails.tsx

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { LocalePopulationAdjusted } from '@entities/locale/LocalePopulationAdjusted';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, LocaleSource } from '@entities/types/DataTypes';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { numberToFixedUnlessSmall, numberToSigFigs } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import { PercentageDifference } from '@shared/ui/PercentageDifference';
import Pill from '@shared/ui/Pill';

type Props = { locale: LocaleData };

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
          <HoverableObjectName object={language} />
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
          {populationSpeaking.toLocaleString()}
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
          ~{numberToSigFigs(populationWriting, 3).toLocaleString()}
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
                      {censusEstimate.populationEstimate.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {numberToFixedUnlessSmall(censusEstimate.populationPercent)}%
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

/** CLDR Support section */
const LocaleCLDRSupportSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const cldr = getCldrLocale(locale.ID);
  if (!cldr) {
    return (
      <DetailsSection title="CLDR Support">
        <Deemphasized>Not supported by CLDR.</Deemphasized>
      </DetailsSection>
    );
  }
  return (
    <DetailsSection title="CLDR Support">
      <DetailsField title="Tier:">{cldr.tier}</DetailsField>
      <DetailsField title="Present in CLDR:">
        {cldr.presentInCLDRDatabase ? 'Yes' : 'No'}
      </DetailsField>
      <DetailsField title="Default Locale:">
        {cldr.localeIsDefaultForLanguage ? 'Yes' : 'No'}
      </DetailsField>
      <DetailsField title="Target / Computed Level:">
        {cldr.targetLevel ?? '—'} / {cldr.computedLevel ?? '—'}
      </DetailsField>
      {cldr.confirmedPct != null && (
        <DetailsField title="Confirmed %:">{cldr.confirmedPct.toFixed(1)}%</DetailsField>
      )}
      {cldr.icuIncluded != null && (
        <DetailsField title="ICU:">{cldr.icuIncluded ? 'Yes' : 'No'}</DetailsField>
      )}
      {cldr.missingCounts && (
        <DetailsField title="Missing Counts:">
          {cldr.missingCounts.found} found / {cldr.missingCounts.unconfirmed} unconfirmed /{' '}
          {cldr.missingCounts.missing} missing
        </DetailsField>
      )}
      {cldr.notes && cldr.notes.length > 0 && (
        <DetailsField title="Missing Features:">{cldr.notes.join(', ')}</DetailsField>
      )}
const LocaleOtherSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { officialStatus, wikipedia, localeSource, containedLocales } = locale;
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
      {containedLocales && containedLocales.length > 0 && (
        <DetailsField title="Contains Locales:">
          <CommaSeparated>
            {containedLocales.map((loc) => (
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
  }
};

export default LocaleDetails;
