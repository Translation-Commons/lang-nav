import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = { lang: LanguageData };

const LanguagePopulationDetails: React.FC<Props> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource } = lang;

  const title = (
    <>
      Population
      {populationEstimateSource && (
        <span style={{ fontSize: '0.75em', fontWeight: 'normal', marginLeft: '0.5em' }}>
          (<PopulationSourceCategoryDisplay sourceCategory={populationEstimateSource} />)
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
              <LanguagePopulationEstimate lang={lang} />
            </div>
            <Deemphasized>Speakers</Deemphasized>
          </div>
        </div>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
