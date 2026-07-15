import React from 'react';

import TerritoryDataYear from '@features/data/context/TerritoryDataYear';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationAdjusted from '@entities/locale/LocalePopulationAdjusted';
import LocalePopulationBreakdown from '@entities/locale/LocalePopulationBreakdown';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData, LocaleSource } from '@entities/locale/LocaleTypes';
import LocaleIndigeneityDisplay, {
  getIndigeneityDescription,
} from '@entities/locale/localstatus/LocaleIndigeneityDisplay';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/old/CommaSeparated';
import CountOfPeople from '@shared/ui/old/CountOfPeople';
import DecimalNumber from '@shared/ui/old/DecimalNumber';
import Deemphasized from '@shared/ui/old/Deemphasized';
import { PercentageDifference } from '@shared/ui/old/PercentageDifference';
import Pill from '@shared/ui/old/Pill';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

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
          <HoverableObjectName object={language} />
        ) : (
          <span>
            {languageCode} <Deemphasized>[language not in database]</Deemphasized>
          </span>
        )}
      </DetailsField>
      {(territory || territoryCode) && (
        <DetailsField title="Territory">
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
        <DetailsField title="Writing System">
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
        <DetailsField title="Writing System">
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
      {variantCodes && variantCodes.length > 0 && (
        <DetailsField title={`Variant${variantCodes.length > 1 ? 's' : ''}`}>
          {variants ? (
            <CommaSeparated>
              {variants.map((tag) => (
                <HoverableObjectName key={tag.ID} object={tag} />
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

const LocalePopulationSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { censusRecords, pop, territory } = locale;
  const [showPopulationBreakdown, setShowPopulationBreakdown] = React.useState(false);

  return (
    <DetailsSection title="Population">
      {pop.speaking.unadjusted == null && (
        <Deemphasized>No population data available.</Deemphasized>
      )}

      {pop.speaking.adjusted && (
        <DetailsField title={`Population Adjusted to ${TerritoryDataYear}`}>
          <LocalePopulationAdjusted locale={locale} />
          <HoverableButton
            style={{ marginLeft: '0.5em', padding: '0.25em', fontWeight: 'normal' }}
            onClick={() => setShowPopulationBreakdown(!showPopulationBreakdown)}
          >
            {showPopulationBreakdown ? 'hide' : 'show'} breakdown
          </HoverableButton>
          {showPopulationBreakdown && (
            <div style={{ margin: '0em 1em 1em 1em' }}>
              <LocalePopulationBreakdown locale={locale} />
            </div>
          )}
        </DetailsField>
      )}

      {pop.speaking.unadjusted != null && (
        <DetailsField title="Speakers (from best cited source(s))">
          <CountOfPeople count={pop.speaking.unadjusted} />
          {' ['}
          <LocaleCensusCitation locale={locale} />
          {']'}
        </DetailsField>
      )}
      {pop.speaking.percent != null && (
        <DetailsField
          title={
            <span style={{ marginLeft: '2em' }}>
              % in {getTerritoryScopeLabel(territory?.scope).toLowerCase()}
            </span>
          }
        >
          {numberToFixedUnlessSmall(pop.speaking.percent)}%
        </DetailsField>
      )}
      {pop.writing.unadjusted != null && territory && (
        <DetailsField title="Writers">
          ~<CountOfPeople count={pop.writing.unadjusted} />
          {' [previous estimate * literacy'}
          {territory.literacyPercent != null && ` (${territory.literacyPercent.toFixed(1)}%)`}
          {']'}
        </DetailsField>
      )}
      {pop.writing.percent != null && (
        <DetailsField
          title={
            <span style={{ marginLeft: '2em' }}>
              % in {getTerritoryScopeLabel(territory?.scope).toLowerCase()}
            </span>
          }
        >
          {numberToFixedUnlessSmall(pop.writing.percent)}%
        </DetailsField>
      )}

      {censusRecords && censusRecords.length > 0 && (
        <DetailsField title="Other Censuses">
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
                        percentOld={pop.speaking.percent}
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
          <ObjectWikipediaInfo object={locale} />
        </DetailsField>
      )}
      <DetailsField title="Locale Source">
        <LocaleSourceLabel localeSource={localeSource} />
      </DetailsField>
      {relatedLocales?.moreGeneral && relatedLocales.moreGeneral.length > 0 && (
        <DetailsField title="More General Locales">
          <CommaSeparated>
            {relatedLocales.moreGeneral.map((locale) => (
              <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.moreSpecific && relatedLocales.moreSpecific.length > 0 && (
        <DetailsField title="More Specific Locales">
          <CommaSeparated>
            {relatedLocales.moreSpecific.map((locale) => (
              <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.parentLanguage && (
        <DetailsField title="Parent Language Locale">
          <HoverableObjectName object={relatedLocales.parentLanguage} labelSource="code" />
        </DetailsField>
      )}
      {relatedLocales?.childLanguages && relatedLocales.childLanguages.length > 0 && (
        <DetailsField title="Child Language Locales">
          <CommaSeparated>
            {relatedLocales.childLanguages.map((locale) => (
              <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
            ))}
          </CommaSeparated>
        </DetailsField>
      )}
      {relatedLocales?.parentTerritory && (
        <DetailsField title="Encapsulating Territory Locale">
          <HoverableObjectName object={relatedLocales.parentTerritory} labelSource="code" />
        </DetailsField>
      )}
      {relatedLocales?.childTerritories && relatedLocales.childTerritories.length > 0 && (
        <DetailsField title="Contained Territory Locales">
          <CommaSeparated>
            {relatedLocales.childTerritories.map((locale) => (
              <HoverableObjectName key={locale.ID} object={locale} labelSource="code" />
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
