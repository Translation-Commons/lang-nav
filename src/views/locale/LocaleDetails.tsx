import React from 'react';

import Deemphasized from '../../generic/Deemphasized';
import { numberToFixedUnlessSmall, numberToSigFigs } from '../../generic/numberUtils';
import { PercentageDifference } from '../../generic/PercentageDifference';
import { LocaleData } from '../../types/DataTypes';
import DetailsField from '../common/details/DetailsField';
import DetailsSection from '../common/details/DetailsSection';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectWikipediaInfo from '../common/ObjectWikipediaInfo';

import LocaleCensusCitation from './LocaleCensusCitation';
import { getOfficialLabel } from './LocaleStrings';

type Props = {
  locale: LocaleData;
};

const LocaleDetails: React.FC<Props> = ({ locale }) => {
  const { officialStatus, wikipedia } = locale;
  return (
    <div className="Details">
      <LocaleDefinitionSection locale={locale} />
      <LocalePopulationSection locale={locale} />
      <DetailsSection title="Other">
        {officialStatus && (
          <DetailsField title="Government Status:">{getOfficialLabel(officialStatus)}</DetailsField>
        )}
        {wikipedia && (
          <DetailsField title="Wikipedia:">
            <ObjectWikipediaInfo object={locale} />
          </DetailsField>
        )}
      </DetailsSection>
    </div>
  );
};

const LocaleDefinitionSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    explicitScriptCode,
    language,
    languageCode,
    territory,
    territoryCode,
    variantTag,
    variantTagCode,
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
      <DetailsField title="Territory:">
        {territory ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>
            {territoryCode} <Deemphasized>[territory not in database]</Deemphasized>
          </span>
        )}
      </DetailsField>
      {explicitScriptCode && (
        <DetailsField title="Writing System:">
          {writingSystem ? (
            <HoverableObjectName object={writingSystem} />
          ) : (
            <span>
              {explicitScriptCode} <Deemphasized>[writing system not in database]</Deemphasized>
            </span>
          )}
        </DetailsField>
      )}
      {variantTagCode && (
        <DetailsField title="Variant Tag:">
          {variantTag ? (
            <HoverableObjectName object={variantTag} />
          ) : (
            <span>
              {variantTagCode} <Deemphasized>[variant not in database]</Deemphasized>
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
    populationSpeaking,
    populationSpeakingPercent,
    populationWriting,
    populationWritingPercent,
    territory,
  } = locale;

  return (
    <DetailsSection title="Population">
      <DetailsField title="Speakers:">
        {populationSpeaking.toLocaleString()}
        {' ['}
        <LocaleCensusCitation locale={locale} />
        {']'}
      </DetailsField>
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
      {populationWriting && territory && (
        <DetailsField title="Writers:">
          ~{numberToSigFigs(populationWriting, 3).toLocaleString()}
          {' [previous estimate * literacy'}
          {territory.literacyPercent != null && ` (${territory.literacyPercent}%)`}
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

      {censusRecords?.length > 0 && (
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

export default LocaleDetails;
