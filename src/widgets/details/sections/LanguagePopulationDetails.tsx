import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguagePopulationOfDescendants, {
  LanguagePopulationBreakdownFromDescendants,
} from '@entities/language/population/LanguagePopulationFromDescendants';
import { LanguagePopulationBreakdownFromLocales } from '@entities/language/population/LanguagePopulationFromLocales';
import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import CountOfPeopleCompact from '@shared/ui/CountOfPeopleCompact';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = { lang: LanguageData };

const LanguagePopulationBreakdownContent: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimateSource } = lang;
  if (populationEstimateSource === PopulationSourceCategory.AggregatedFromTerritories)
    return <LanguagePopulationBreakdownFromLocales lang={lang} />;
  if (populationEstimateSource === PopulationSourceCategory.AggregatedFromLanguages)
    return <LanguagePopulationBreakdownFromDescendants lang={lang} />;
  return null;
};

const getSourceLabel = (source?: PopulationSourceCategory): string | null => {
  switch (source) {
    case PopulationSourceCategory.AggregatedFromTerritories:
      return 'aggregated from territories';
    case PopulationSourceCategory.AggregatedFromLanguages:
      return 'aggregated from dialects';
    case PopulationSourceCategory.Ethnologue:
      return 'from Ethnologue';
    case PopulationSourceCategory.Algorithmic:
      return 'algorithmically derived';
    default:
      return null;
  }
};

const LanguagePopulationDetails: React.FC<Props> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource, populationOfDescendants } = lang;
  const sourceLabel = getSourceLabel(populationEstimateSource);

  const title = (
    <>
      Population
      {sourceLabel && (
        <span style={{ fontSize: '0.75em', fontWeight: 'normal', marginLeft: '0.5em' }}>
          ({sourceLabel})
        </span>
      )}
    </>
  );

  return (
    <DetailsSection title={title}>
      {populationEstimate == null ? (
        <Deemphasized>No population data available.</Deemphasized>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '2em',
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginTop: 'auto',
            paddingBottom: '0.5em',
            flexGrow: 1,
          }}
        >
          {/* Speakers */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>
              <Hoverable hoverContent={<LanguagePopulationBreakdownContent lang={lang} />}>
                <CountOfPeopleCompact count={populationEstimate} />
              </Hoverable>
            </div>
            <Deemphasized>Speakers</Deemphasized>
          </div>

          {/* Descendants */}
          {populationOfDescendants != null &&
            populationOfDescendants > 10 &&
            populationEstimateSource !== PopulationSourceCategory.AggregatedFromLanguages && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>
                  <Hoverable hoverContent={<LanguagePopulationOfDescendants lang={lang} />}>
                    <CountOfPeopleCompact count={populationOfDescendants} />
                  </Hoverable>
                </div>
                <Deemphasized>Descendants</Deemphasized>
              </div>
            )}
        </div>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
