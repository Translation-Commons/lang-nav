import React, { useMemo } from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import { useDataContext } from '@features/data/context/useDataContext';
import EntityMap from '@features/map/EntityMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';

import TableOfLanguagesInCensus from '@entities/census/TableOfLanguagesInCensus';
import { EntityType } from '@entities/types/EntityTypes';

import CensusPopulationCharacteristics from './CensusPopulationCharacteristics';
import CensusPrimarySection from './CensusPrimarySection';
import CensusSourceSection from './CensusSourceSection';
import { CensusData } from './CensusTypes';

type Props = {
  census: CensusData;
};

const CensusDetails: React.FC<Props> = ({ census }) => {
  const { getLanguage } = useDataContext();
  const languages = useMemo(
    () =>
      Object.keys(census.languageEstimates)
        .map((langID) => getLanguage(langID))
        .filter((lang) => lang != null),
    [census.languageEstimates, getLanguage],
  );

  return (
    <div className="Details">
      <CensusPrimarySection census={census} />
      <CensusPopulationCharacteristics census={census} />
      <CensusSourceSection census={census} />
      <DetailsSection title="Languages" score={census.languageCount}>
        <LocalParamsProvider overrides={{ page: 1, limit: 20, orgFilter: '' }}>
          <TableOfLanguagesInCensus census={census} />
        </LocalParamsProvider>
      </DetailsSection>
      <DetailsSection title="Languages on Map">
        <LocalParamsProvider
          overrides={{ entType: EntityType.Language, limit: 1000, searchString: '' }}
        >
          <EntityMap entities={languages} maxWidth={1000} />
        </LocalParamsProvider>
      </DetailsSection>
    </div>
  );
};

export default CensusDetails;
