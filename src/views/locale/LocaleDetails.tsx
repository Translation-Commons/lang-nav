import React from 'react';

import { numberToFixedUnlessSmall, numberToSigFigs } from '../../generic/numberUtils';
import { PercentageDifference } from '../../generic/PercentageDifference';
import { LocaleData } from '../../types/DataTypes';
import HoverableObjectName from '../common/HoverableObjectName';

import LocaleCensusCitation from './LocaleCensusCitation';
import { getOfficialLabel } from './LocaleStrings';

type Props = {
  locale: LocaleData;
};

const LocaleDetails: React.FC<Props> = ({ locale }) => {
  const { officialStatus } = locale;
  return (
    <div className="Details">
      <LocaleDefinitionSection locale={locale} />
      <LocalePopulationSection locale={locale} />
      {officialStatus && (
        <div className="section">
          <h3>Other</h3>
          <div>
            <label>Government status:</label>
            {getOfficialLabel(officialStatus)}
          </div>
        </div>
      )}
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
    variantTags,
    writingSystem,
  } = locale;

  return (
    <div className="section">
      <h3>Definition</h3>
      <div>
        <label>Language:</label>
        {language ? (
          <HoverableObjectName object={language} />
        ) : (
          <span>
            {languageCode} <em>[language not in database]</em>
          </span>
        )}
      </div>
      <div>
        <label>Territory:</label>
        {territory ? (
          <HoverableObjectName object={territory} />
        ) : (
          <span>
            {territoryCode} <em>[territory not in database]</em>
          </span>
        )}
      </div>
      {explicitScriptCode && (
        <div>
          <label>Writing System:</label>
          {writingSystem ? (
            <HoverableObjectName object={writingSystem} />
          ) : (
            <span>
              {explicitScriptCode} <em>[writing system not in database]</em>
            </span>
          )}
        </div>
      )}
      {variantTags && (
        <div>
          <h3>Variant</h3>
          <HoverableObjectName object={variantTags} />
        </div>
      )}
    </div>
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
    <div className="section">
      <h3>Population</h3>
      <div>
        <label>Speakers:</label>
        {populationSpeaking.toLocaleString()}
        {' ['}
        <LocaleCensusCitation locale={locale} />
        {']'}
      </div>
      {populationSpeakingPercent != null && (
        <div>
          <label style={{ marginLeft: '2em' }}>
            % in {territory?.scope.toLowerCase() ?? 'territory'}:
          </label>
          {numberToFixedUnlessSmall(populationSpeakingPercent)}%
        </div>
      )}
      {populationWriting && territory && (
        <div>
          <label>Writers:</label>~{numberToSigFigs(populationWriting, 3).toLocaleString()}
          {' [previous estimate * literacy'}
          {territory.literacyPercent != null && ` (${territory.literacyPercent}%)`}
          {']'}
        </div>
      )}
      {populationWritingPercent != null && (
        <div>
          <label style={{ marginLeft: '2em' }}>
            % in {territory?.scope.toLowerCase() ?? 'territory'}:
          </label>
          {numberToFixedUnlessSmall(populationWritingPercent)}%
        </div>
      )}

      {censusRecords.length > 0 && (
        <div>
          <label>Other Censuses:</label>
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
        </div>
      )}
    </div>
  );
};

export default LocaleDetails;
