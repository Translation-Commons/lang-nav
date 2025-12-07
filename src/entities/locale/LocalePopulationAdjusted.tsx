import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { isTerritoryGroup, LocaleData, PopulationSourceCategory } from '@entities/types/DataTypes';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import LocaleCensusCitation from './LocaleCensusCitation';

export const LocalePopulationAdjusted: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (locale.populationAdjusted == null) return null;

  return (
    <Hoverable hoverContent={<LocalePopulationBreakdown locale={locale} />}>
      <CountOfPeople count={locale.populationAdjusted} />
    </Hoverable>
  );
};

const LocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (!locale.territory || !locale.populationAdjusted) return null;

  if (
    isTerritoryGroup(locale.territory.scope) ||
    locale.populationSource === PopulationSourceCategory.AggregatedFromLanguages ||
    locale.populationSource === PopulationSourceCategory.AggregatedFromTerritories
  ) {
    return <RegionalLocalePopulationBreakdown locale={locale} />;
  }
  return <CountryLocalePopulationBreakdown locale={locale} />;
};

const RegionalLocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { populationAdjusted, populationSpeaking } = locale;

  return (
    <table>
      <tbody>
        {populationSpeaking !== populationAdjusted && (
          <tr>
            <LabelCell>Population Unadjusted:</LabelCell>
            <td className="count">
              <CountOfPeople count={populationSpeaking!} />
            </td>
          </tr>
        )}
        <tr>
          <LabelCell>Population Adjusted to 2025:</LabelCell>
          <td className="count">
            <CountOfPeople count={populationAdjusted!} />
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            Since the territory for this locale is a regional grouping, the data is added up from
            the populations of all constituent territories:
          </td>
        </tr>
        {[...(locale.localesWithinThisLanguage || []), ...(locale.localesWithinThisTerritory || [])]
          ?.sort((a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0))
          .slice(0, 5)
          .map((childLocale) => (
            <tr key={childLocale.ID}>
              <td style={{ paddingLeft: '1em' }}>
                <HoverableObjectName
                  object={childLocale}
                  labelSource={
                    locale.languageCode === childLocale.languageCode ? 'territory' : 'language'
                  }
                />
              </td>
              <td className="count">
                <CountOfPeople count={childLocale.populationAdjusted} />
              </td>
              <td>
                [<LocaleCensusCitation locale={childLocale} size="short" />]
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

const CountryLocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    populationAdjusted,
    populationCensus,
    populationSpeaking,
    populationSpeakingPercent,
    territory,
  } = locale;
  if (!populationSpeaking || !populationAdjusted || !territory || !populationSpeakingPercent)
    return null;

  let yearCollected: React.ReactNode = populationCensus?.yearCollected;
  if (!yearCollected || populationCensus?.collectorType === CensusCollectorType.CLDR) {
    yearCollected = <Deemphasized>date unknown</Deemphasized>;
  }

  return (
    <table>
      <tbody>
        <tr>
          <LabelCell>Language Population Recorded ({yearCollected}):</LabelCell>
          <td>
            <CountOfPeople count={populationSpeaking} />
          </td>
        </tr>
        <tr>
          <LabelCell>% of Territory:</LabelCell>
          <td>{numberToFixedUnlessSmall(populationSpeakingPercent)}</td>
        </tr>
        <tr>
          <LabelCell>Source:</LabelCell>
          <td>
            {populationCensus ? (
              <HoverableObjectName object={populationCensus} />
            ) : (
              <Deemphasized>No citation</Deemphasized>
            )}
          </td>
        </tr>
        <tr>
          <LabelCell>Territory Population (when data collected):</LabelCell>
          <td>
            <CountOfPeople count={(populationSpeaking! / populationSpeakingPercent!) * 100} />
          </td>
        </tr>
        <tr>
          <LabelCell>Territory Population (2025):</LabelCell>
          <td>
            <CountOfPeople count={territory.population} />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            Assuming linear population growth, <CountOfPeople count={territory!.population} /> *{' '}
            {numberToFixedUnlessSmall(populationSpeakingPercent!)}% =
          </td>
        </tr>
        <tr>
          <LabelCell>Population Adjusted to 2025:</LabelCell>
          <td>
            <CountOfPeople count={populationAdjusted} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const LabelCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th style={{ fontWeight: 'bold', textAlign: 'left' }}>{children}</th>
);
