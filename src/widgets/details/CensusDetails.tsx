import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import EntityMap from '@features/map/EntityMap';
import LocalParamsProvider from '@features/params/LocalParamsProvider';
import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';

import TableOfLanguagesInCensus from '../tables/TableOfLanguagesInCensus';

import CensusPopulationCharacteristics from './sections/CensusPopulationCharacteristics';
import CensusPrimarySection from './sections/CensusPrimarySection';
import CensusSourceSection from './sections/CensusSourceSection';
import DetailsSection from './ui/DetailsSection';

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
      <DetailsSection title="Languages">
        <LocalParamsProvider overrides={{ page: 1, limit: 20 }}>
          <TableOfLanguagesInCensus census={census} />
        </LocalParamsProvider>
      </DetailsSection>
      <DetailsSection title="Languages on Map">
        <LocalParamsProvider
          overrides={{ objectType: ObjectType.Language, limit: 1000, searchString: '' }}
        >
          <EntityMap entities={languages} maxWidth={1000} />
        </LocalParamsProvider>
      </DetailsSection>
    </div>
  );
};

export default CensusDetails;
