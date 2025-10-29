import React from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { isTerritoryGroup, LocaleData } from '@entities/types/DataTypes';

import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import Deemphasized from '@shared/ui/Deemphasized';

export const LocalePopulationAdjusted: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (locale.populationAdjusted == null) return null;

  return (
    <Hoverable hoverContent={<LocalePopulationBreakdown locale={locale} />}>
      {locale.populationAdjusted.toLocaleString()}
    </Hoverable>
  );
};

const LocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  if (!locale.territory || !locale.populationAdjusted) return null;
  return isTerritoryGroup(locale.territory.scope) ? (
    <RegionalLocalePopulationBreakdown locale={locale} />
  ) : (
    <CountryLocalePopulationBreakdown locale={locale} />
  );
};

const RegionalLocalePopulationBreakdown: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { populationAdjusted, populationSpeaking } = locale;

  return (
    <table>
      <tr>
        <LabelCell>Population Unadjusted:</LabelCell>
        <td>{populationSpeaking!.toLocaleString()}</td>
      </tr>
      <tr>
        <LabelCell>Population Adjusted to 2025:</LabelCell>
        <td>{populationAdjusted!.toLocaleString()}</td>
      </tr>
      <tr>
        <td colSpan={2}>
          Since the territory for this locale is a regional grouping, the data is added up from the
          populations of all constituent territories:
        </td>
      </tr>
      {locale.containedLocales
        ?.sort((a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0))
        .slice(0, 5)
        .map((childLocale) => (
          <tr key={childLocale.ID}>
            <td style={{ paddingLeft: '1em' }}>
              <HoverableObjectName object={childLocale} labelSource="territory" />
            </td>
            <td>{childLocale.populationAdjusted?.toLocaleString()}</td>
          </tr>
        ))}
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
      <tr>
        <LabelCell>Language Population Recorded ({yearCollected}):</LabelCell>
        <td>{populationSpeaking.toLocaleString()}</td>
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
        <td>{((populationSpeaking! / populationSpeakingPercent!) * 100).toLocaleString()}</td>
      </tr>
      <tr>
        <LabelCell>Territory Population (2025):</LabelCell>
        <td>{territory!.population.toLocaleString()}</td>
      </tr>
      <tr>
        <td colSpan={2}>
          Assuming linear population growth, {territory!.population.toLocaleString()} *{' '}
          {numberToFixedUnlessSmall(populationSpeakingPercent!)}% =
        </td>
      </tr>
      <tr>
        <LabelCell>Population Adjusted to 2025:</LabelCell>
        <td>{populationAdjusted!.toLocaleString()}</td>
      </tr>
    </table>
  );
};

const LabelCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th style={{ fontWeight: 'bold', textAlign: 'left' }}>{children}</th>
);
